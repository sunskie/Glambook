\# 🌟 GlamBook - Beauty Service Booking Platform



A full-stack web application for booking beauty services, connecting beauty professionals (vendors) with clients seamlessly.



---



\## 📋 Table of Contents



\- \[Project Overview](#project-overview)

\- \[Features](#features)

\- \[Technology Stack](#technology-stack)

\- \[Project Structure](#project-structure)

\- \[Installation \& Setup](#installation--setup)

\- \[API Endpoints](#api-endpoints)

\- \[Screenshots](#screenshots)

\- \[Future Enhancements](#future-enhancements)

\- \[Author](#author)



---



\## 🎯 Project Overview



\*\*GlamBook\*\* is a comprehensive beauty service booking platform designed to streamline the process of discovering and booking beauty services. The platform supports three user roles:



\- \*\*Vendors\*\*: Beauty service providers who can list and manage their services

\- \*\*Clients\*\*: Users who can browse and book services

\- \*\*Admins\*\*: Platform administrators with full system access



This project was developed as a \*\*Final Year Project\*\* demonstrating full-stack web development skills, secure authentication, role-based access control, and modern UI/UX design principles.



---



\## ✨ Features



\### 🔐 Authentication \& Authorization

\- User registration with role selection (Vendor/Client/Admin)

\- Secure login with JWT (JSON Web Tokens)

\- Password hashing with bcrypt

\- Role-based access control middleware

\- Protected routes based on user roles



\### 💼 Vendor Features

\- \*\*Service Management Dashboard\*\*

&nbsp; - View all services with statistics (Total, Active, Inactive)

&nbsp; - Create new services with image uploads

&nbsp; - Edit existing services

&nbsp; - Delete services with confirmation modal

&nbsp; - Real-time search functionality

&nbsp; - Filter by category and status

&nbsp; 

\- \*\*Service Creation\*\*

&nbsp; - Title, description, price, duration inputs

&nbsp; - Category selection (Hair, Makeup, Spa, Nails, Skincare, Massage, Other)

&nbsp; - Image upload (JPEG, PNG, GIF, WEBP - max 5MB)

&nbsp; - Active/Inactive status toggle

&nbsp; - Form validation with character counters



\### 🔒 Security Features

\- Vendor ownership validation (only service owner can edit/delete)

\- JWT token-based authentication

\- Protected API routes

\- Input validation on both frontend and backend

\- Secure password storage with bcrypt hashing



\### 🎨 User Interface

\- Responsive design (mobile, tablet, desktop)

\- Modern UI with Tailwind CSS

\- Toast notifications for user feedback

\- Custom delete confirmation modals

\- Loading states and error handling

\- Smooth transitions and animations



---



\## 🛠️ Technology Stack



\### Backend

\- \*\*Runtime\*\*: Node.js

\- \*\*Framework\*\*: Express.js

\- \*\*Language\*\*: TypeScript

\- \*\*Database\*\*: MongoDB with Mongoose ODM

\- \*\*Authentication\*\*: JSON Web Tokens (JWT)

\- \*\*Security\*\*: bcrypt for password hashing

\- \*\*File Upload\*\*: Multer middleware

\- \*\*Environment\*\*: dotenv



\### Frontend

\- \*\*Library\*\*: React 18

\- \*\*Language\*\*: TypeScript

\- \*\*Build Tool\*\*: Vite

\- \*\*Styling\*\*: Tailwind CSS

\- \*\*Routing\*\*: React Router v6

\- \*\*HTTP Client\*\*: Axios

\- \*\*Notifications\*\*: react-hot-toast

\- \*\*State Management\*\*: Context API



\### Development Tools

\- Git \& GitHub for version control

\- Postman for API testing

\- VS Code as IDE

\- npm for package management



---



\## 📁 Project Structure

```

Glambook/

├── backend/

│   ├── src/

│   │   ├── config/

│   │   │   └── db.ts                 # MongoDB connection

│   │   ├── controllers/

│   │   │   ├── auth.controller.ts     # Authentication logic

│   │   │   ├── service.controller.ts  # Service CRUD operations

│   │   │   └── users.controller.ts    # User management

│   │   ├── middleware/

│   │   │   ├── auth.middleware.ts     # JWT verification

│   │   │   ├── role.middleware.ts     # Role-based access

│   │   │   └── upload.middleware.ts   # Multer config

│   │   ├── models/

│   │   │   ├── User.model.ts          # User schema

│   │   │   └── Service.model.ts       # Service schema

│   │   ├── routes/

│   │   │   ├── auth.routes.ts         # Auth endpoints

│   │   │   ├── service.routes.ts      # Service endpoints

│   │   │   └── users.routes.ts        # User endpoints

│   │   ├── types/

│   │   │   ├── auth.ts                # Auth types

│   │   │   └── express.d.ts           # Express extensions

│   │   └── server.ts                  # App entry point

│   ├── uploads/                       # Uploaded images

│   ├── .env                           # Environment variables

│   ├── package.json

│   └── tsconfig.json

│

├── Frontend/

│   ├── src/

│   │   ├── components/

│   │   │   ├── auth/

│   │   │   │   ├── InputField.tsx     # Reusable input

│   │   │   │   └── AuthButton.tsx     # Auth buttons

│   │   │   └── common/

│   │   │       ├── ConfirmModal.tsx   # Delete confirmation

│   │   │       └── Toast.tsx          # Notifications

│   │   ├── context/

│   │   │   └── AuthContext.tsx        # Global auth state

│   │   ├── pages/

│   │   │   ├── auth/

│   │   │   │   ├── LoginPage.tsx      # Login UI

│   │   │   │   └── RegisterPage.tsx   # Registration UI

│   │   │   └── Vendor/

│   │   │       ├── VendorDashboard.tsx    # Service grid

│   │   │       ├── CreateService.tsx      # Create form

│   │   │       └── EditService.tsx        # Edit form

│   │   ├── services/

│   │   │   └── api/

│   │   │       ├── authService.ts     # Auth API calls

│   │   │       └── serviceService.ts  # Service API calls

│   │   ├── types/

│   │   │   └── index.ts               # TypeScript types

│   │   ├── utils/

│   │   │   └── api.ts                 # Axios instance

│   │   ├── App.tsx                    # Main app component

│   │   └── main.tsx                   # React entry point

│   ├── public/

│   ├── package.json

│   ├── tailwind.config.js

│   ├── tsconfig.json

│   └── vite.config.ts

│

├── .gitignore

└── README.md

```



---



\## 🚀 Installation \& Setup



\### Prerequisites

\- Node.js (v16 or higher)

\- MongoDB (local or Atlas)

\- npm or yarn package manager

\- Git



\### Backend Setup



1\. \*\*Clone the repository\*\*

```bash

&nbsp;  git clone https://github.com/sunskie/Glambook.git

&nbsp;  cd Glambook

```



2\. \*\*Navigate to backend directory\*\*

```bash

&nbsp;  cd backend

```



3\. \*\*Install dependencies\*\*

```bash

&nbsp;  npm install

```



4\. \*\*Create .env file\*\*

```env

&nbsp;  PORT=5000

&nbsp;  MONGODB\_URI=your\_mongodb\_connection\_string

&nbsp;  JWT\_SECRET=your\_secret\_key\_here

&nbsp;  NODE\_ENV=development

```



5\. \*\*Run the backend server\*\*

```bash

&nbsp;  npm run dev

```

&nbsp;  Server runs on `http://localhost:5000`



\### Frontend Setup



1\. \*\*Navigate to frontend directory\*\*

```bash

&nbsp;  cd ../Frontend

```



2\. \*\*Install dependencies\*\*

```bash

&nbsp;  npm install

```



3\. \*\*Run the development server\*\*

```bash

&nbsp;  npm run dev

```

&nbsp;  Frontend runs on `http://localhost:5173`



---



\## 📡 API Endpoints



\### Authentication

```

POST   /api/auth/register    - Register new user

POST   /api/auth/login       - Login user

GET    /api/auth/me          - Get current user (protected)

```



\### Services

```

POST   /api/services              - Create service (vendor only)

GET    /api/services              - Get all services (with filters)

GET    /api/services/my-services  - Get vendor's services (vendor only)

GET    /api/services/:id          - Get single service

PUT    /api/services/:id          - Update service (owner only)

DELETE /api/services/:id          - Delete service (owner/admin)

```



\### Query Parameters for Services

```

?category=Hair          - Filter by category

?status=active          - Filter by status

?minPrice=50            - Minimum price filter

?maxPrice=200           - Maximum price filter

?search=haircut         - Search in title and description

```



---



\## 📸 Screenshots



<!-- Add screenshots here after deployment -->



\### Authentication

\- Login Page

\- Registration Page



\### Vendor Dashboard

\- Service Grid View

\- Create Service Form

\- Edit Service Form

\- Delete Confirmation Modal



---



\## 🔮 Future Enhancements



\- \[ ] Client-side service browsing and booking

\- \[ ] Booking management system

\- \[ ] Payment integration

\- \[ ] Real-time notifications

\- \[ ] Review and rating system

\- \[ ] Vendor analytics dashboard

\- \[ ] Admin panel for platform management

\- \[ ] Email notifications

\- \[ ] Advanced search with location

\- \[ ] Calendar integration for bookings



---



\## 👨‍💻 Author



\*\*Barsha Shrestha\*\*

\- GitHub: \[@sunskie](https://github.com/sunskie)

\- Project: Final Year Project - GlamBook

\- Institution: \[Your University Name]



---



\## 📄 License



This project is developed as a Final Year Project for academic purposes.



---



\## 🙏 Acknowledgments



\- Thanks to all open-source libraries used in this project

\- Special thanks to \[Your Supervisor's Name] for guidance

\- Inspired by modern booking platforms



---



\*\*⭐ If you found this project helpful, please give it a star!\*\*

