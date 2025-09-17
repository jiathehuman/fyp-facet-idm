# Facet Identity Management Platform

## Running the application
### Using Docker
`docker compose up -d --build`

In another terminal while the container is running:
`docker compose exec backend python manage.py migrate`

### Using backend and frontend commands
`cd backend`
`python -m venv .venv`
`source .venv/bin/activate`
`python manage.py runserver`

`cd frontend`
`npm run install`
`npm run dev`

Access the application at: (http://localhost:5173/)

To test:
`docker compose exec backend python manage.py test --settings=api.settings_test`
Or
`python manage.py test --settings=api.settings_test`