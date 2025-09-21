# Facet Identity Management Platform
Facet Identity Management System is a secure and user-friendly identity management platform targetted at young adults to manage their diverse online identities. The application boasts a React frontend, a Django backend and a Postgresql database deployed to cloud on Railway.

Through this platform, you can manage multiple online identities through personas.

## Running the application

The application is best used with Firefox browser.

### Using Docker
`docker compose up -d --build`

In another terminal while the container is running:
`docker compose exec backend python manage.py migrate`

To test:
`docker compose exec backend python manage.py test --settings=api.settings_test`

### Using backend and frontend commands
`cd backend` <br>
`python -m venv .venv` <br>
`pip install -r requirements.txt` <br>
`source .venv/bin/activate` <br>
`python manage.py makemigrations` <br>
`python manage.py migrate` <br>
`python manage.py runserver` <br>

`cd frontend` <br>
`npm run install` <br>
`npm run dev` <br>

Access the application at: (http://localhost:5173/) <br>
Interact with endpoints with Swagger at (http://127.0.0.1:8000/docs/)

To test:
`python manage.py test --settings=api.settings_test`