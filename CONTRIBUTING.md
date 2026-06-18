# Contributing to CAREER BRIDGE - AI 🤝

First of all, thank you for considering contributing to CAREER BRIDGE - AI! It's people like you who make it such a great tool for the workforce.

## 🚀 Setting Up the Development Environment

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/YOUR_USERNAME/CAREER-SETU---AI.git
    cd CAREER-SETU---AI
    ```
3.  **Set up the Backend**:
    ```bash
    cd backend
    python -m venv venv
    # Windows: venv\Scripts\activate | macOS/Linux: source venv/bin/activate
    pip install -r requirements.txt
    python -m spacy download en_core_web_sm
    ```
4.  **Set up the Frontend**:
    ```bash
    cd ../frontend
    npm install
    ```
5.  **Environment Variables**:
    Create `.env` files in both `backend` and `frontend` folders (refer to `.env.example` if available).

## 🛠️ How to Contribute

1.  **Search for an issue**: Look for existing issues or create a new one to discuss your proposed changes.
2.  **Create a New Branch**:
    ```bash
    git checkout -b feature/your-feature-name
    # OR
    git checkout -b fix/your-fix-name
    ```
3.  **Develop & Test**: Ensure your changes follow the existing code style and pass any tests.
4.  **Commit Your Changes**:
    Use clear and concise commit messages:
    - `feat: add AI roadmap generator`
    - `fix: resolve resume parsing bug`
    - `docs: update setup instructions`
5.  **Push to GitHub**:
    ```bash
    git push origin your-branch-name
    ```
6.  **Create a Pull Request**: Submit your PR through the GitHub interface for review.

## 📝 Commit Guidelines

Keep it simple:
- Use consistent prefixes: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`.
- Use the imperative mood ("Add feature" instead of "Added feature").

## ⚖️ Code of Conduct

Help us keep CAREER BRIDGE - AI open and inclusive. Please read and follow our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

Thank you for your help! ✨
