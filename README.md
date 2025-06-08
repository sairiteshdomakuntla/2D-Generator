# 🎨 AnimateAI - AI-Powered Animation Generator

**AnimateAI** is a powerful web application that allows users to create, customize, and export procedural animations using natural language. It leverages AI to convert text prompts into interactive [p5.js](https://p5js.org/) animations with real-time conversational refinement and export features.

---

## 🚀 Features

### ✨ Core Functionality
- **Text-to-Animation Generation**: Describe an animation in plain language to generate dynamic visuals.
- **Conversational Refinement**: Modify and evolve animations using a built-in AI chat interface.
- **Video Export**: Export animations as downloadable `.webm` videos.
- **Animation Library**: Organize and manage your animations in a personal collection.
- **Responsive Design**: Fully functional on both desktop and mobile devices.

---

## 🛠 Technical Implementation

### 🔧 Frontend (React + Vite)
- **Dynamic Rendering**: Animations rendered in sandboxed iframes using p5.js.
- **MediaRecorder API**: Record canvas and export as `.webm`.
- **Theme Support**: Toggle between dark and light modes with persistent preferences.
- **Real-time Chat**: Interactive chat interface for refining animations.
- **Responsive UI**: Sidebar and layout adapt seamlessly to different screen sizes.

### 🧩 Backend (Node.js + Express)
- **AI Integration**: Utilizes Gemini API for generating p5.js code from prompts.
- **Database**: MongoDB for animations, users, and conversation history.
- **Authentication**: Secure login/signup via [Clerk](https://clerk.dev).
- **Credit System**: Usage tracked with optional credit purchase.
- **Payments**: Integrated with [Razorpay](https://razorpay.com/) for transactions.

---

## 🔐 Security Features
- **Sandboxed Execution**: Isolated iframe execution of animation code.
- **JWT Authentication**: Secure API communication using Clerk tokens.
- **CSP Headers**: Content Security Policy to mitigate injection risks.
- **Input Validation**: Robust server-side validation of all user data.
- **Error Handling**: User-friendly error messages and fail-safes throughout.

---

## 🧠 AI Integration

- **Prompt Engineering**: Specialized prompts for generating p5.js code.
- **Code Cleaning**: Post-processing of AI outputs to ensure valid JavaScript.
- **Context-Aware Modifications**: Provides existing code context for targeted changes.
- **Fail-Safe Mechanisms**: Handles AI generation failures gracefully.

---

## 🏗 Technical Architecture

### 🧱 Client-Side
- **Component-Based**: Modular React architecture.
- **Hooks & State**: Local state managed via React hooks.
- **Routing**: Navigation handled with React Router.
- **API Integration**: Axios with auto-injection of authentication headers.
- **Styling**: Built using Tailwind CSS for sleek, responsive design.

### 🗄 Server-Side
- **RESTful APIs**: Cleanly structured endpoints for animations, users, and payments.
- **Middleware**: Auth checks, credit enforcement, rate limiting.
- **MongoDB Models**: Schema-based models for users, animations, and credit logs.
- **Robust Error Responses**: Standardized error formats and logging.
- **Environment Configuration**: Secure `.env` management for sensitive keys.

---

## 🔁 Animation Generation Flow

1. User enters a natural language prompt describing the animation.
2. The prompt is sent to the backend.
3. Backend forwards it to Gemini AI with optimized prompt instructions.
4. Gemini returns p5.js code.
5. Code is validated and returned to frontend.
6. Animation is rendered in a sandboxed iframe.
7. Animation and chat history are saved to MongoDB.

---

## 🎥 Video Recording Flow

1. User sets a desired video duration.
2. On clicking "Export Video", a message is sent to the iframe.
3. The iframe starts MediaRecorder to capture the canvas.
4. After recording, the `.webm` video is available for download.

---

## 💻 Getting Started

### 🧰 Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB Atlas (or local MongoDB instance)
- Clerk and Razorpay credentials
- Gemini API key

### 📦 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/animateai.git
cd animateai

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install

---

## 🔑 Environment Variables

Create `.env` files in both `client/` and `server/` directories with the following keys:

### 📁 Example `.env` for Server
<pre><code>PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
CLERK_SECRET_KEY=your_clerk_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
</code></pre>

### 📁 Example `.env` for Client
<pre><code>VITE_CLERK_FRONTEND_API=your_clerk_frontend_api
VITE_SERVER_URL=http://localhost:5000
</code></pre>

---

## 🙌 Acknowledgements

- [p5.js](https://p5js.org/)
- [Clerk.dev](https://clerk.dev/)
- [Razorpay](https://razorpay.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Gemini AI](https://deepmind.google/technologies/gemini/)
