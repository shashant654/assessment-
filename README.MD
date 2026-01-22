# Zangoh AI Agent Supervisor Workstation

## Overview

The Zangoh AI Agent Supervisor Workstation is a comprehensive interface that allows human supervisors to monitor, intervene, and improve AI customer service agents. This application provides real-time monitoring, intervention capabilities, agent configuration, analytics, and response template management.

## Features Implemented

### 1. Agent Monitoring Dashboard ✅

- **Real-time conversation view** with WebSocket updates
- **Key metrics display**: Resolution rate, response time, customer satisfaction, escalations
- **Alert system** for problematic conversations (high alert badge)
- **Filtering options** by status, alert level, and agent
- **Multiple tabs**: All Conversations, Needs Attention, Agent Performance
- **Metrics cards** with trend indicators

### 2. Intervention Interface ✅

- **Full conversation history** with message timeline
- **"Take Control" functionality** to assume control from AI
- **"Release Control" option** to return control to AI with notes
- **Send messages as supervisor** with template support
- **Real-time conversation updates** via WebSocket
- **Customer and agent information** sidebar
- **Performance metrics** display (response time, sentiment, confidence)

### 3. Agent Configuration ✅

- **Select and configure multiple agents**
- **Adjust AI parameters**:
  - Temperature (0-1 scale)
  - Top P (nucleus sampling)
  - Max Tokens (50-2000)
- **Enable/disable capabilities** with toggle UI
- **Configure knowledge base access** with switches
- **Set escalation thresholds**:
  - Low confidence threshold
  - Negative sentiment threshold
  - Response time threshold
- **Save and reset configurations**
- **Real-time updates** to backend

### 4. Response Template Management ✅

- **Create, edit, and delete templates**
- **Category-based organization** (Greeting, Problem Resolution, Escalation, etc.)
- **Variable substitution system** with `{{variableName}}` syntax
- **Template usage in conversation view** with variable filling
- **Share templates with team**
- **Copy template content** to clipboard
- **Filter templates by category**

### 5. Analytics & Insights ✅

- **Comprehensive analytics dashboard** with multiple views
- **Trend charts** using Recharts:
  - Conversation volume trends
  - Sentiment trends
  - Response time trends
  - Escalation rate trends
- **Agent performance comparison**:
  - Conversation volume by agent
  - Satisfaction scores by agent
  - Response times by agent
  - Detailed metrics table
- **Top issues analysis**:
  - Bar chart of top 10 issues
  - Pie chart distribution
  - Issue details list
- **Status distribution**:
  - Pie chart of conversation statuses
  - Daily status breakdown
  - Status breakdown with progress bars
- **Time range filtering** (Today, This Week, This Month)

## Technology Stack

### Backend

- **Node.js** with Express
- **MongoDB** for data storage
- **WebSockets** (ws library) for real-time updates
- **Mongoose** for ODM
- **Docker** for containerization

### Frontend

- **React** with Hooks
- **Chakra UI** component library
- **React Router** for navigation
- **Recharts** for data visualization
- **Axios** for API calls
- **WebSocket client** for real-time updates

## Project Structure

```
test-agent/
├── backend-starter/
│   ├── data/                   # Sample data
│   ├── middleware/             # Express middleware
│   │   ├── errorHandler.js    # Error handling
│   │   └── requestLogger.js   # Request logging
│   ├── models/                 # MongoDB models
│   │   ├── agent.js           # Agent model
│   │   ├── conversation.js    # Conversation model
│   │   ├── knowledgeBase.js   # Knowledge base model
│   │   └── responseTemplate.js # Template model
│   ├── routes/                 # API routes
│   │   ├── agents.js          # Agent CRUD operations
│   │   ├── analytics.js       # Analytics endpoints
│   │   ├── conversations.js   # Conversation operations
│   │   ├── intervene.js       # Intervention operations
│   │   ├── knowledgeBase.js   # Knowledge base operations
│   │   └── templates.js       # Template CRUD operations
│   ├── utils/                  # Utility functions
│   ├── websocket/              # WebSocket handlers
│   │   └── socketHandler.js   # Real-time updates
│   └── server.js              # Main server file
│
├── frontend-starter/
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── api/               # API client
│   │   │   └── index.js      # API functions
│   │   ├── components/        # React components
│   │   │   ├── ConversationList.js
│   │   │   ├── Header.js
│   │   │   ├── Layout.js
│   │   │   ├── MetricsCard.js
│   │   │   └── Sidebar.js
│   │   ├── context/           # React context
│   │   │   ├── AppDataContext.js
│   │   │   └── WebSocketContext.js
│   │   ├── pages/             # Page components
│   │   │   ├── AgentConfig.js
│   │   │   ├── Analysis.js
│   │   │   ├── ConversationView.js
│   │   │   ├── Dashboard.js
│   │   │   └── Templates.js
│   │   ├── utils/             # Utility functions
│   │   ├── app.js            # Main App component
│   │   ├── index.js          # Entry point
│   │   └── theme.js          # Chakra UI theme
│   └── package.json
│
├── data-samples/              # Sample data and init scripts
├── docker/                    # Docker configuration
├── docker-compose.yaml        # Docker Compose setup
├── package.json               # Root dependencies
└── README.MD                  # This file
```

## Setup Instructions

### Prerequisites

- Docker and Docker Compose
- Node.js (v16 or later)
- npm or yarn
- A modern web browser (Chrome or Firefox recommended)

### Installation & Running

1. **Clone or navigate to the project directory**

   ```bash
   cd test-agent
   ```

2. **Start all services with Docker Compose**

   ```bash
   docker-compose up -d
   ```

   This will start:
   - MongoDB database (port 27017)
   - Qdrant vector database (port 6333)
   - Backend API server (port 9000)
   - Frontend development server (port 3000)
   - Ollama (port 11434)

3. **Verify services are running**

   ```bash
   docker ps
   ```

   You should see containers for backend, frontend, mongodb, qdrant, and ollama.

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:9000
   - API Documentation: http://localhost:9000/api-docs

### Alternative: Manual Setup (without Docker)

If you prefer to run services manually:

1. **Start MongoDB**

   ```bash
   mongod --dbpath /path/to/data
   ```

2. **Install and start backend**

   ```bash
   cd backend-starter
   npm install
   npm run dev
   ```

3. **Install and start frontend**
   ```bash
   cd frontend-starter
   npm install
   npm start
   ```

### Environment Variables

Backend (.env):

```
MONGODB_URI=mongodb://localhost:27017/zangoh
PORT=9000
NODE_ENV=development
QDRANT_URL=http://localhost:6333
```

Frontend (.env):

```
REACT_APP_API_URL=http://localhost:9000
REACT_APP_WS_URL=ws://localhost:9000
```

## API Endpoints

### Conversations

- `GET /api/conversations` - Get all conversations with pagination and filtering
- `GET /api/conversations/:id` - Get specific conversation
- `POST /api/conversations/:id/messages` - Add message to conversation
- `PATCH /api/conversations/:id/status` - Update conversation status
- `POST /api/conversations/:id/tags` - Add tags to conversation

### Agents

- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get specific agent
- `PATCH /api/agents/:id/config` - Update agent configuration
- `GET /api/agents/:id/metrics` - Get agent metrics

### Intervention

- `POST /api/intervene` - Intervene in conversation
- `POST /api/intervene/release` - Release intervention

### Templates

- `GET /api/templates` - Get all templates
- `GET /api/templates/:id` - Get specific template
- `POST /api/templates` - Create new template
- `PATCH /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template
- `POST /api/templates/:id/apply` - Apply template with variables

### Analytics

- `GET /api/analytics` - Get analytics summary
- `GET /api/analytics/trends` - Get trend data
- `GET /api/analytics/top-issues` - Get top issues

### Knowledge Base

- `GET /api/knowledge-base` - Get knowledge bases

## WebSocket Events

### Client → Server

- `subscribe` - Subscribe to specific channels

### Server → Client

- `connection` - Connection established
- `ping` - Heartbeat
- `conversations_update` - Full conversation list update
- `new_conversation` - New conversation created
- `message_update` - New message in conversation
- `metrics_update` - Metrics updated for conversation
- `agent_update` - Agent data updated

## Usage Guide

### Monitoring Conversations

1. Navigate to the Dashboard
2. View all active conversations in the conversation list
3. Filter by status, alert level, or agent
4. Click on "Needs Attention" tab to see high-priority conversations
5. Click on any conversation to view details

### Intervening in Conversations

1. Click on a conversation from the dashboard
2. Review the conversation history and metrics
3. Click "Take Control" to assume control from the AI
4. Send messages as supervisor
5. Use templates to speed up responses
6. Click "Release Control" when ready to return to AI

### Using Response Templates

1. Navigate to Templates page
2. Create new templates with variables (e.g., `{{customerName}}`)
3. Use templates in conversation view by clicking the template icon
4. Fill in variable values when prompted
5. Template content is inserted into message box

### Configuring Agents

1. Navigate to AI Agent page
2. Select the agent you want to configure
3. Adjust model parameters (temperature, max tokens, top P)
4. Enable/disable capabilities
5. Configure knowledge base access
6. Set escalation thresholds
7. Click "Save Changes"

### Viewing Analytics

1. Navigate to Analysis page
2. Select time range (Today, Week, Month)
3. View different tabs:
   - Trends: Volume, sentiment, response time trends
   - Agent Performance: Compare agent metrics
   - Top Issues: See most common problems
   - Status Distribution: View conversation statuses

## Challenges Faced and Solutions

### Challenge 1: Real-time Updates

**Problem**: Keeping the frontend synchronized with backend conversation updates.
**Solution**: Implemented WebSocket connections with message type handling and context-based state management.

### Challenge 2: Template Variable Substitution

**Problem**: Supporting dynamic variables in templates with user-friendly UI.
**Solution**: Created a double-curly-brace syntax (`{{variableName}}`) with a modal for variable input and backend endpoint for substitution.

### Challenge 3: Complex State Management

**Problem**: Managing multiple data sources (conversations, agents, templates) across components.
**Solution**: Implemented React Context API with AppDataContext and WebSocketContext for centralized state management.

### Challenge 4: Chart Rendering Performance

**Problem**: Large datasets causing slow chart rendering in analytics.
**Solution**: Used Recharts with ResponsiveContainer and optimized data aggregation on the backend.

### Challenge 5: Intervention Flow

**Problem**: Ensuring smooth handoff between AI and human supervisor.
**Solution**: Implemented status tracking with "escalated" state and intervention metadata in the conversation model.

## Architecture Highlights

### Backend Architecture

- **RESTful API**: Clean separation of concerns with route handlers
- **MongoDB Models**: Mongoose schemas for data validation
- **WebSocket Layer**: Real-time bidirectional communication
- **Middleware**: Error handling and request logging
- **Modular Routes**: Each feature has its own route file

### Frontend Architecture

- **Component-Based**: Reusable React components
- **Context API**: Global state management
- **Custom Hooks**: Reusable logic (useAppData, useWebSocket)
- **Responsive Design**: Chakra UI responsive components
- **Route-Based Code Splitting**: Separate pages for each feature

### Data Flow

1. User interacts with UI
2. Frontend makes API call via axios
3. Backend processes request and updates MongoDB
4. Backend broadcasts WebSocket event
5. Frontend receives WebSocket event
6. Context updates and components re-render

## Testing

To test the complete workflow:

1. **Start the application** using Docker Compose
2. **Monitor conversations** on the dashboard
3. **Click on a conversation** to view details
4. **Take control** and send a message
5. **Use a template** with variables
6. **Configure an agent** and save changes
7. **View analytics** and trend charts
8. **Create a response template**
9. **Release control** back to AI

## Future Enhancements

- User authentication and authorization
- Multi-tenancy support
- Advanced search and filtering
- Conversation export/import
- Custom report generation
- Machine learning model for auto-escalation
- Integration with external CRM systems
- Mobile responsive design improvements
- Dark mode enhancements
- Performance optimizations for large datasets

## Contributing

This is a challenge submission. For production use, consider:

- Adding comprehensive test coverage (unit, integration, e2e)
- Implementing proper authentication/authorization
- Adding rate limiting and security headers
- Setting up CI/CD pipelines
- Implementing proper logging and monitoring
- Adding database indexes for performance
- Implementing caching strategies

## License

This project was created as part of the Zangoh AI Agent Supervisor Workstation Challenge.

## Contact

For questions or support, please contact the development team.

---

**Built with ❤️ using React, Node.js, MongoDB, and Chakra UI**
Agent Configuration Screen: For adjusting AI agent parameters and capabilities
Focus on implementing the functionality according to these designs. Pixel-perfect reproduction is not required, but your implementation should closely match the overall layout and user experience.
Available APIs
The backend provides the following API endpoints:
Conversations
GET /api/conversations: Get all conversations with filtering
GET /api/conversations/:id: Get a specific conversation
POST /api/conversations/:id/messages: Add a message to a conversation
PATCH /api/conversations/:id/status: Update conversation status
POST /api/conversations/:id/tags: Add tags to a conversation
Agents
GET /api/agents: Get all agents
GET /api/agents/:id: Get a specific agent
PATCH /api/agents/:id/config: Update agent configuration
GET /api/agents/:id/metrics: Get agent performance metrics
Intervention
POST /api/intervene: Intervene in a conversation
POST /api/intervene/release: End intervention and return to agent
Knowledge Base
GET /api/knowledge-base: Get all knowledge bases
LLM Mock API
POST /api/llm/generate: Generate LLM response
POST /api/llm/sentiment: Analyze text sentiment
WebSocket API
The WebSocket server provides real-time updates for:
New conversations
Message updates
Metrics changes
Agent status changes
Refer to the API documentation at http://localhost:9000/api-docs for detailed information.
Testing Your Implementation
A testing script is provided to help you validate your implementation. Run it with:
cd testing
npm install
node test-runner.js

This will check the core functionality of your implementation and provide feedback on what's working and what needs attention.
Implementation Requirements
Your implementation should include:

1. Agent Monitoring Dashboard
   Real-time view of active customer conversations with AI agents
   Key metrics display (resolution rate, average response time, customer satisfaction)
   Alert system for potentially problematic conversations
   Filtering options (by agent, status, alert level)
2. Intervention Interface
   Ability to view full conversation history for any active session
   "Take over" functionality to assume control from the AI agent
   Agent performance feedback mechanism
   Option to return control to the AI with notes/guidance
3. Agent Configuration
   Adjust AI parameters (temperature, max tokens, etc.)
   Enable/disable specific capabilities or knowledge domains
   Configure automatic escalation thresholds
   Save and load configuration presets
   Tips for Success
   Start with core functionality: Implement the basic features first before adding polish
   Use the provided components: The starter code includes basic components you can build upon
   Test incrementally: Use the testing script to validate your progress
   Manage your time: Allocate time for each major feature, leaving time for integration and testing
   Read the API docs: Understand the available endpoints before implementation
   Study the designs: Familiarize yourself with all screens before starting to understand the complete system
   Submission
   When you're done, submit your solution as follows:
   Ensure all code is committed:

git add .
git commit -m "Final submission"

Create a zip file of your solution:

# From the project root

zip -r submission.zip . -x "node_modules/_" "_/node_modules/_" ".git/_"

Upload your submission to the platform or provide a GitHub repository link as instructed

Include in your submission:

Complete source code
Setup instructions if you've modified the environment
Brief description of your implementation, challenges faced, and solutions
Any notes for the evaluator
Evaluation Criteria
Your solution will be evaluated based on:
Functionality (40%): Does it fulfill all the requirements?
Code Quality (25%): Is the code well-structured, maintainable, and efficient?
Design Implementation (15%): How well does it match the provided designs?
Technical Decisions (20%): Are the technical choices appropriate and efficient?
Need Help?
If you encounter any issues with the environment setup:
Check the Docker logs: docker-compose logs <service-name>
Ensure all services are running: docker ps
Restart the environment if needed: docker-compose down && docker-compose up -d
Good luck!



## for frontend 

npm start  

## for backend 
npm run start 


