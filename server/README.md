# Job Tracker Backend

Flask REST API backend for the job tracker application.

## Deployment

This app is configured for deployment to Heroku.

### Prerequisites

- Heroku CLI installed
- Heroku account

### Deployment Steps

1. Clone or download this repository
2. Navigate to the server directory
3. Run the following commands:

```bash
heroku login
heroku create your-app-name
git push heroku main
```

### Environment Variables

After deployment, set these config vars in your Heroku dashboard:
- `JWT_SECRET_KEY` = "your-very-secure-secret-key"
- `USE_POSTGRESQL` = "true"

The app is now ready for deployment to Heroku!