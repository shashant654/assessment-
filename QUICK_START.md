# Quick Start Guide

This guide will help you get the Zangoh AI Agent Supervisor Workstation up and running quickly.

## Prerequisites Check

Before starting, ensure you have:

- ✅ Docker Desktop installed and running
- ✅ Docker Compose installed (included with Docker Desktop)
- ✅ At least 4GB of free RAM
- ✅ Ports 3000, 9000, 27017, 6333, and 11434 available

## Quick Start (Recommended)

### Step 1: Start the Application

```powershell
# Navigate to project directory
cd "e:\coding\dev\test-agent (5)\test-agent"

# Start all services with Docker Compose
docker-compose up -d
```

### Step 2: Wait for Services to Initialize

Wait 30-60 seconds for all containers to start and initialize. You can check the status:

```powershell
docker ps
```

You should see 5 containers running:

- zangoh-supervisor-frontend
- zangoh-supervisor-backend
- zangoh-mongodb
- zangoh-qdrant
- zangoh-ollama

### Step 3: Access the Application

Open your web browser and navigate to:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:9000
- **API Documentation**: http://localhost:9000/api-docs

### Step 4: Explore the Features

1. **Dashboard** (http://localhost:3000)
   - View all active conversations
   - See key metrics
   - Click on "Needs Attention" tab for high-priority items

2. **Conversation View**
   - Click on any conversation from the dashboard
   - Try "Take Control" to intervene
   - Send a message as supervisor
   - Use the template button to insert templates
   - Click "Release Control" when done

3. **Agent Configuration** (via sidebar)
   - Select an agent from the dropdown
   - Adjust parameters (temperature, max tokens, etc.)
   - Enable/disable capabilities
   - Set escalation thresholds
   - Click "Save Changes"

4. **Templates** (via sidebar)
   - Click "Create Template"
   - Add a name and category
   - Write content with variables like `{{customerName}}`
   - Add variable definitions
   - Save and use in conversations

5. **Analysis** (via sidebar)
   - View trend charts
   - Compare agent performance
   - See top issues
   - Check status distribution

## Troubleshooting

### Services Not Starting

```powershell
# Check Docker logs
docker-compose logs

# Restart services
docker-compose down
docker-compose up -d
```

### Port Already in Use

If you get a "port already in use" error:

```powershell
# Find what's using the port (example for port 3000)
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change the port in docker-compose.yaml
```

### Frontend Can't Connect to Backend

1. Check if backend is running:

   ```powershell
   curl http://localhost:9000/health
   ```

2. Check Docker network:

   ```powershell
   docker-compose logs backend
   ```

3. Restart the backend container:
   ```powershell
   docker-compose restart backend
   ```

### No Data Showing

1. Check if MongoDB is running:

   ```powershell
   docker-compose logs mongodb
   ```

2. Seed the database (if needed):
   ```powershell
   docker-compose exec backend npm run seed
   ```

### WebSocket Not Connecting

1. Check browser console for errors
2. Verify WebSocket URL in frontend .env
3. Restart frontend container:
   ```powershell
   docker-compose restart frontend
   ```

## Stopping the Application

```powershell
# Stop all services
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v
```

## Manual Setup (Alternative)

If Docker is not working, you can run services manually:

### 1. Start MongoDB

```powershell
# Install MongoDB or use MongoDB Atlas
mongod --dbpath C:\data\db
```

### 2. Start Backend

```powershell
cd backend-starter
npm install
$env:MONGODB_URI="mongodb://localhost:27017/zangoh"
$env:PORT="9000"
npm run dev
```

### 3. Start Frontend

```powershell
cd frontend-starter
npm install
$env:REACT_APP_API_URL="http://localhost:9000"
$env:REACT_APP_WS_URL="ws://localhost:9000"
npm start
```

## Default Test Data

The application comes pre-loaded with:

- 3 AI agents (Customer Service, Sales, Support)
- Sample conversations with different statuses
- Sample metrics and analytics data
- Pre-configured escalation thresholds

## Next Steps

1. ✅ Explore the dashboard and familiarize yourself with the UI
2. ✅ Try intervening in a conversation
3. ✅ Create a response template
4. ✅ Configure an agent
5. ✅ View analytics and trends
6. ✅ Test real-time updates (open multiple browser tabs)

## Useful Commands

```powershell
# View all running containers
docker ps

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Restart a specific service
docker-compose restart backend

# Execute command in container
docker-compose exec backend npm run seed

# Check Docker resource usage
docker stats

# Clean up everything
docker-compose down -v --remove-orphans
```

## Performance Tips

1. **Allocate sufficient resources to Docker Desktop**
   - Recommended: 4GB RAM, 2 CPUs
   - Settings → Resources → Advanced

2. **Close unused applications**
   - Free up system resources
   - Ensure ports are not blocked

3. **Use a modern browser**
   - Chrome or Firefox recommended
   - Enable hardware acceleration

4. **Check network connection**
   - WebSocket requires stable connection
   - Disable VPN if experiencing issues

## Support

If you encounter any issues:

1. Check the logs: `docker-compose logs`
2. Verify all containers are running: `docker ps`
3. Check the [README.md](README.MD) for detailed information
4. Review [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for features

## Testing Checklist

- [ ] Dashboard loads successfully
- [ ] Conversations list is populated
- [ ] Metrics cards show data
- [ ] Click on a conversation to view details
- [ ] "Take Control" button works
- [ ] Can send messages
- [ ] Can use templates
- [ ] Can configure agents
- [ ] Analytics page shows charts
- [ ] Can create templates
- [ ] Real-time updates work (open two tabs)

## Success!

If you can:

- ✅ See the dashboard with conversations
- ✅ View conversation details
- ✅ Send messages as supervisor
- ✅ See analytics charts
- ✅ Create and use templates

**Congratulations! The application is working correctly.**

---

**Happy Testing!** 🚀
