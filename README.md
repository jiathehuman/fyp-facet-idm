# Facet Identity Management Platform

Facet Identity Management System is a secure and user-friendly identity management platform targeted at young adults to manage their diverse online identities. The application boasts a React frontend, a Django backend and a PostgreSQL database deployed to cloud on Railway.

Through this platform, you can manage multiple online identities through personas.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Using Docker (Recommended)](#using-docker-recommended)
  - [Manual Setup](#manual-setup)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)

## Features

- Secure identity management
- Google social log in or Metamask Ethereum Authentication
- Multiple persona creation and management
- RESTful API architecture
- Responsive React frontend
- Django REST framework backend
- PostgreSQL database
- Cloud deployment on Railway
- Comprehensive test suite

## Tech Stack

**Frontend:**
- React
- JavaScript/TypeScript
- Vite (build tool)

**Backend:**
- Django
- Django REST Framework
- Python

**Database:**
- PostgreSQL

**DevOps:**
- Docker & Docker Compose
- Railway (deployment)

## Prerequisites

Before running the application, ensure you have the following installed:

- **Docker & Docker Compose** (for Docker setup)
- **Python 3.8+** (for manual setup)
- **Node.js 16+** and **npm** (for manual setup)
- **PostgreSQL** (for manual setup)
- **Firefox browser** (recommended for optimal experience)

## Installation & Setup

### Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd facet-identity-platform
   ```

2. Build and start the containers:
   ```bash
   docker compose up -d --build
   ```

3. Run database migrations:
   ```bash
   docker compose exec backend python manage.py migrate
   ```

4. Access the application at [http://localhost:5173/](http://localhost:5173/)

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up the database:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. Start the Django development server:
   ```bash
   python manage.py runserver
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Access the application at [http://localhost:5173/](http://localhost:5173/)

## Testing

### Using Docker

Run the test suite with:
```bash
docker compose exec backend python manage.py test --settings=api.settings_test
```

### Manual Testing

Ensure your virtual environment is activated, then run:
```bash
python manage.py test --settings=api.settings_test
```

## API Documentation

Once the backend is running, you can interact with the API endpoints using Swagger UI at:
[http://127.0.0.1:8000/docs/](http://127.0.0.1:8000/docs/)

## Project Structure

```
facet-identity-platform/
├── backend/
│   ├── api/
│   ├── manage.py
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── docker-compose.yml
└── README.md
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/facet_db

# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Frontend
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## Browser Compatibility
The application is optimized for **Firefox browser**. While it may work on other browsers, Firefox provides the best user experience.


**This project is built in fulfilment of CM3070 Final Year Project.**
