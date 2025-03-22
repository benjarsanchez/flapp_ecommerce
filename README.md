Para ejecutar front localmente:

1. npm install
2. nvm use 18.18.0 
3. npm run build
4. npm run start

Para ejecutar back localmente:
- docker-compose up --build

.env backend:
PORT=8000
DATABASE_URL=postgres://{USERNAME}}:{USERNAME PWD}@localhost:5432/url_shortener
DB_NAME=url_shortener
DB_USER=postgres
DB_PASSWORD=
DB_HOST=localhost
LOCAL_FRONTEND_URL=http://localhost:3000

.env front
NEXT_PUBLIC_API_URL="http://localhost:8000"
