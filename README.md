# Facet Identity Management Platform

## Running the application
### Using Docker
`docker compose up -d --build`

In another terminal while the container is running:
`docker compose exec backend python manage.py migrate`

To test:
`docker compose exec backend python manage.py test --settings=api.settings_test`

### Using backend and frontend commands
`cd backend`
`python -m venv .venv`
`pip install -r requirements.txt`
`source .venv/bin/activate`
`python manage.py makemigrations`
`python manage.py migrate
`
`python manage.py runserver`

`cd frontend`
`npm run install`
`npm run dev`

Access the application at: (http://localhost:5173/)
Interact with endpoints with Swagger at (http://127.0.0.1:8000/docs/)

To test:
`python manage.py test --settings=api.settings_test`