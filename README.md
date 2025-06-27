# PromptToSoftware Frontend

This repository contains the source code for the PromptToSoftware web application frontend. PromptToSoftware uses AI agents to build software based on user requests, allowing users to manage projects, track costs, and interact with agents.

## Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Accessibility](#accessibility)
- [Responsive Design](#responsive-design)
- [Contributing](#contributing)
- [Contact](#contact)
- [License](#license)

## About The Project

PromptToSoftware is a web application that enables users to leverage AI agents for software development. Users can submit requests, monitor the progress of their projects, manage their accounts and payments, and engage in limited communication with the AI agents. This frontend application provides a minimalist, intuitive, and responsive user interface for seamless interaction with the PromptToSoftware backend services.

## Features

*   **Authentication:** Secure sign-in via GitHub OAuth.
*   **Account Management:** View account balance, add funds via Stripe, manage saved payment cards, and earn credits by watching ads.
*   **Project Management:**
    *   **Create Project:** Define project brief, set max runtime and budget, select GitHub repositories (new or existing), and get real-time cost estimations.
    *   **Dashboard:** Overview of active projects, spending trends, and budget predictions.
    *   **Projects List:** Comprehensive view of all projects with status and basic details.
    *   **Project Details:** In-depth view of individual projects, including live status, cost, elapsed time, and interactive chat/history, with options to stop/resume projects.
*   **Explore Projects:** Discover trending or recent public projects with search and sorting capabilities.
*   **User Support:** Dedicated Help page covering key aspects like GitHub integration, billing, and add-ons.
*   **Interactions:** Handle AI agent communications, including sensitive information requests.
*   **Notifications:** Real-time updates via Firebase Cloud Messaging.
*   **User Guidance:** Interactive tutorial for new users.
*   **Persistent Elements:** Collapsible side navigation, always-visible profile, balance, and action buttons.
*   **Dynamic Banners:** Information banners related to project updates or announcements.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Docker Desktop (recommended for consistent development environment)
*   Node.js (LTS version) and npm/yarn (if not using Docker)

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/prompttosoftware-frontend.git
    cd prompttosoftware-frontend
    ```

2.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory by copying `.env.example`.
    ```bash
    cp .env.example .env.local
    ```
    Populate the variables in `.env.local` according to your specific local backend and service configurations.
    *   `NEXT_PUBLIC_API_BASE_URL`: Base URL for the PromptToSoftware backend API.
    *   `NEXT_PUBLIC_GITHUB_OAUTH_CLIENT_ID`: Your GitHub OAuth application client ID.
    *   `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase API Key for notifications.
    *   *(and other Firebase credentials as needed)*

3.  **Run with Docker (Recommended):**
    This ensures a consistent environment matching the project's development constraints.
    ```bash
    docker-compose up --build
    ```
    This command will:
    *   Build the Docker image (if not already built).
    *   Start the Next.js development server inside a Docker container.
    *   The application will be accessible at `http://localhost:3000`.

4.  **Run Natively (Alternative):**
    If you prefer not to use Docker, ensure you have Node.js and npm/yarn installed.
    ```bash
    npm install  # or yarn install
    npm run dev  # or yarn dev
    ```
    The application will be accessible at `http://localhost:3000`.

## Project Structure

The project follows a standard Next.js `app` directory structure, enhanced for modularity and maintainability:

```
prompttosoftware-frontend/
├── public/                 # Static assets (images, fonts)
├── src/                    # Main source code
│   ├── app/                # Next.js App Router root layout and pages
│   │   ├── (auth)/         # Grouped authentication routes
│   │   ├── (main)/         # Grouped main application routes
│   │   ├── api/            # Next.js API Routes (if any server-side logic)
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable UI components (buttons, forms, navigation)
│   │   ├── common/
│   │   ├── layout/
│   │   └── ...
│   ├── context/            # React Contexts for global state
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions, API client, type definitions
│   │   ├── api/            # API client setup and wrappers
│   │   ├── constants.ts
│   │   ├── models/         # TypeScript interfaces for API data
│   │   └── ...
│   ├── services/           # Logic for interacting with external SDKs (Stripe, Firebase)
│   ├── styles/             # Tailwind CSS configuration and global styles
│   ├── tests/              # Separate folder for test utilities and MSW mocks
│   │   └── msw/
│   └── types/              # Global TypeScript types and interfaces
├── .env.example            # Example environment variables
├── Dockerfile              # Docker container definition for development
├── docker-compose.yml      # Docker Compose setup for local development
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── ...
```

## Technology Stack

*   **Frontend Framework:** React.js (with Next.js)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **State Management:** React Context API, Zustand (or similar, depending on complexity)
*   **HTTP Client:** `axios` (or native `fetch`)
*   **Data Caching:** React Query or SWR
*   **Forms:** React Hook Form
*   **ML Model:** `transformers.js` (for client-side cost estimation)
*   **Notifications:** Firebase JavaScript SDK
*   **Charting:** Recharts or Chart.js
*   **Payment Integration:** Stripe.js & Stripe Elements

## API Endpoints

The frontend interacts with the PromptToSoftware backend via the following primary API categories:

*   **Authentication:** `/auth/github`, `/auth/me`, `/auth/logout`
*   **User Account:** `/users/me`
*   **Payments & Billing:** `/payments/create-intent`, `/payments/cards`, `/payments/cards/{id}`, `/ads/credit`
*   **Projects:** `/projects`, `/projects/explore`, `/projects/{id}`, `/projects/{id}/start`, `/projects/{id}/stop`, `/projects/{id}/status`
*   **Project Communication:** `/projects/{id}/messages`, `/projects/{id}/history`, `/projects/{id}/response-sensitive`

All authenticated requests require a JWT in the `Authorization: Bearer <TOKEN>` header.

## Testing

The project employs a comprehensive testing strategy covering various levels to ensure quality and reliability, especially within the headless Docker development environment.

### How to Run Tests

```bash
npm test # Runs all unit, infrastructure, and integration tests
npm test -- unit # Run unit tests only
npm test -- infra # Run infrastructure validation tests only
npm test -- integration # Run integration tests only (uses MSW)
npm test -- e2e # Run end-to-end tests (requires dev server running via MSW)
```

### Strategy

*   **Unit Tests:** Isolated testing of pure functions, React Hooks, and individual components using Jest and React Testing Library.
*   **Infrastructure Testing:** Validation of Docker configurations, environment variables, and mocked cloud service SDK interfaces without actual deployment.
*   **Integration Tests:** Testing interactions between components and with mocked API endpoints using Mock Service Worker (MSW) to simulate backend responses.
*   **End-to-End (E2E) Tests:** Simulating critical user journeys through the application in a headless browser environment (Playwright/Cypress) against a mocked backend (via MSW).

## Accessibility

The frontend is built with accessibility in mind, adhering to modern web standards:

*   **Semantic HTML:** Proper use of HTML5 elements.
*   **ARIA Roles:** Strategic application of ARIA attributes for enhanced screen reader compatibility.
*   **Keyboard Navigation:** Full support for keyboard-only users to navigate and interact with all UI elements.
*   **Color Contrast:** Designed with sufficient color contrast to meet WCAG guidelines.
*   **Focus Management:** Careful handling of focus for modals, interactive elements, and routing changes.

## Responsive Design

The application is fully responsive, ensuring an optimal viewing and interaction experience across a wide range of devices and screen sizes:

*   **Desktop:** Full-featured layout with expanded navigation.
*   **Tablet:** Adaptive layouts that adjust to typical tablet orientations.
*   **Mobile:** Prioritized content and simplified navigation for small screens.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

*   Fork the Project
*   Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
*   Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
*   Push to the Branch (`git push origin feature/AmazingFeature`)
*   Open a Pull Request

## Contact

Your Name - [your@email.com](mailto:your@email.com)
Project Link: [https://github.com/your-username/prompttosoftware-frontend](https://github.com/your-username/prompttosoftware-frontend)

## License

Distributed under the MIT License. See `LICENSE` for more information.
