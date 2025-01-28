# SkillHorizon - Server

This repository contains the **server-side** implementation of the SkillHorizon project. It is built using **Node.js** and **Express.js**, with **MongoDB** as the database. The server handles authentication, data management, and API endpoints to support the SkillHorizon platform.

## Live Site URL:
[Live Site - SkillHorizon](https://skillhorizon-11d1f.web.app/)

## Client Repository:
[Client Repository - SkillHorizon](https://github.com/Programming-Hero-Web-Course4/b10a12-client-side-Nabilabintaakter)

## Live Server URL:
[Live Server - SkillHorizon](https://b10-a12-skill-horizon-server.vercel.app/)

---

## Features:
- **RESTful API**: Provides secure and efficient endpoints for data retrieval and manipulation.
- **JWT Authentication**: Protects private routes and ensures secure communication between the client and server.
- **Role-Based Access Control**: Differentiates access for admins, teachers, and students.
- **CRUD Operations**: Handles creation, reading, updating, and deletion of users, classes, and assignments.
- **Data Validation**: Implements server-side validation using tools like `Joi`.
- **Error Handling**: Robust error handling with informative responses.
- **Pagination Support**: Efficient data pagination for user and class lists.
- **Environment Variables**: Securely manages sensitive credentials like database URI and JWT secrets.
- **Teacher & Student Management**: Handles role updates, class enrollments, and assignment submissions.
- **Feedback System**: Collects and stores feedback from students and teachers.

---

## Technologies Used:
- **Node.js**: Backend runtime environment.
- **Express.js**: Web application framework for building REST APIs.
- **MongoDB**: NoSQL database for storing application data.
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB.
- **JWT**: Secure authentication and authorization.
- **Cors**: Enables cross-origin requests.
- **Dotenv**: Loads environment variables.
- **Stripe**: Payment gateway integration (if applicable).

---

## Installation

### Prerequisites:
- Node.js (v16 or above)
- MongoDB (Local or Atlas)
