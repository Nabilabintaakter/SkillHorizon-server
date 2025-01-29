# **SkillHorizon - Server**

This repository contains the **server-side** implementation of the SkillHorizon project. It is built using **Node.js** and **Express.js**, with **MongoDB** as the database. The server handles authentication, data management, and API endpoints to support the SkillHorizon platform.

## **Live Site URL:**  
[Live Site - SkillHorizon](https://skillhorizon-11d1f.web.app/)

## **Client Repository:**  
[Client Repository - SkillHorizon](https://github.com/Nabilabintaakter/SkillHorizon-client)

## **Live Server URL:**  
[Live Server - SkillHorizon](https://b10-a12-skill-horizon-server.vercel.app/)

---

## **Features**
✔ **RESTful API** – Provides secure and efficient endpoints for data retrieval and manipulation.  
✔ **JWT Authentication** – Ensures secure communication and protects private routes.  
✔ **Role-Based Access Control** – Differentiates access for admins, teachers, and students.  
✔ **CRUD Operations** – Handles user, class, and assignment data management.  
✔ **Error Handling** – Provides detailed error responses for better debugging.  
✔ **Pagination Support** – Implements efficient data pagination for large datasets.  
✔ **Environment Variables** – Securely manages sensitive credentials like database URI and JWT secrets.  
✔ **Teacher & Student Management** – Handles role updates, class enrollments, and assignment submissions.  
✔ **Feedback System** – Enables students to provide feedback.  

---

## **Technologies Used**
- **Node.js** – Backend runtime environment.
- **Express.js** – Web framework for building REST APIs.
- **MongoDB** – NoSQL database for storing application data.
- **JWT (JSON Web Token)** – Secure authentication and authorization.
- **Cors** – Enables cross-origin requests.
- **Dotenv** – Manages environment variables.
- **Stripe** – Payment gateway integration (if applicable).

---

## **Installation**

### **Prerequisites:**
Make sure you have the following installed on your system:

✅ **Node.js** (v16 or above)  
✅ **MongoDB** (Local or Atlas)  

### **Steps to Install and Run the Project**

1. **Clone the repository:**
    ```sh
   git clone https://github.com/Nabilabintaakter/SkillHorizon-server.git
   cd SkillHorizon-server
2. **Install dependencies:**
    ```sh
   npm install
3. **Create a .env file in the root directory and add the following environment variables:**
    ```sh
   touch .env
   nano .env 
  
**Then, add the following lines inside .env:**
```sh
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```
   
4. **Start the development server:**
     ```sh
    npm run dev
