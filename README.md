# Trade-offs

Think of it as building Netflix while simultaneously preparing for backend/system design interviews.


Before we write code, we ask:

What is the first capability any streaming platform needs?

The answer is:

Identity.

Netflix must know:

who the user is

what they watched

where they stopped watching

what they like

their subscription plan

device sessions

Everything else in the system depends on this.

So the first real service we build is the Identity layer.

What Problems Are We Solving Today

We want to support these actions:

User signs up
User logs in
User receives authentication token
User calls protected APIs

Example real flow:

User opens Netflix app
      |
      v
POST /login
      |
      v
Server returns auth token
      |
      v
User requests catalog
      |
      v
GET /videos
Authorization: Bearer <token>

This token tells the backend:

“this request belongs to user 123”

System Design Decision #1
Stateless Authentication

There are two ways to authenticate users.

Option 1 — Session Based (Traditional)
login
 -> server creates session
 -> session stored in DB or Redis
 -> browser stores session cookie

Architecture:

User -> API -> Session DB

Problems:

DB lookup every request

difficult to scale horizontally

session synchronization

Option 2 — Token Based (JWT)

Instead of storing session state on server:

login
 -> server generates token
 -> client stores token
 -> every request includes token

Architecture:

User -> API -> Token verification

No database lookup required.

This is called stateless authentication.

That is why most modern systems use JWT.

Why We Chose JWT

Benefits:

stateless
scales easily
works across microservices
no central session store

Tradeoffs:

cannot easily revoke tokens
token size larger
security requires short expiry

Netflix likely uses OAuth + internal identity service, but JWT concept still applies.

What Our Auth System Will Do

Flow:

Signup
 -> store user in database

Login
 -> verify password

Create JWT token
 -> return to client

Client calls APIs with token
 -> server verifies token
Why We Need a Database

Even though authentication is stateless, we still must store:

users
password hashes
subscriptions
watch history
profiles

That means we need persistent storage.

Why We Chose PostgreSQL

We could have used:

Option	Why / Why not
PostgreSQL	strong relational integrity
MongoDB	flexible schema
DynamoDB	cloud native
SQLite	too limited

Netflix uses multiple storage systems, but metadata is relational.

Example relationships:

User -> WatchHistory
User -> Profiles
Video -> Genre
Series -> Episodes

Relational DBs handle this well.

Why We Use an ORM (SQLAlchemy)

Two ways to talk to DB:

Option 1 — Raw SQL

Example:

SELECT * FROM users WHERE email='x'

Problems:

repetitive

error prone

difficult to maintain

manual mapping

Option 2 — ORM

Example:

db.query(User).filter(User.email == email)

Benefits:

object oriented
easier queries
schema management
clean code

Tradeoff:

slightly slower
less SQL control

For this project ORM is perfect.

Why Password Hashing Is Required

We never store passwords directly.

Example of bad storage:

users table
password: "mypassword123"

If DB leaks → all passwords exposed.

Instead we store:

hash(password)

Example:

password_hash:
$2b$12$A8F...

One-way function.

Even the server cannot recover the password.

Why We Use Bcrypt

Options:

SHA256
Argon2
Bcrypt
PBKDF2

Bcrypt is popular because:

slow hashing
resistant to brute force
salt built in
battle tested

Tradeoff:

slower login

But login is infrequent so it's fine.

JWT Token Structure

A JWT looks like:

header.payload.signature

Example:

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Payload might contain:

{
  "sub": 123,
  "exp": 1710000000
}

Meaning:

user_id = 123
token expires at X time

Server verifies signature using secret key.

What the Auth Service Will Provide

Endpoints:

POST /auth/signup
POST /auth/login
GET /auth/me

Responsibilities:

create user
verify password
generate token
verify token
How Requests Will Work

Example protected request:

GET /videos
Authorization: Bearer <JWT>

Backend does:

decode token
extract user_id
attach user to request
Why We Build Auth First

Every later feature needs a user:

watch progress
recommendations
likes
ratings
subscriptions

So auth is foundational infrastructure.

Where This Fits in Our Architecture

Current architecture:

Client
   |
   v
API Service
   |
   +---- Auth
   |
   +---- Catalog
   |
   +---- Streaming

Later we split services if needed.



When Netflix shows the home screen, it’s NOT streaming video yet. It’s fetching metadata:

title, description, thumbnail
duration
release year
genres

So we first build the “catalog” part of the backend.