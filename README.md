# DAM Desktop - AI Usage Intelligence Platform

DAM Desktop is an enterprise-grade desktop application that provides comprehensive AI usage monitoring, optimization, and governance across your organization. Built with Electron, React, and TypeScript, it offers invisible background monitoring while maintaining strict privacy and security standards.

## Features

### AI Coaching & Security
- **Real-time Screen Analysis**: Continuously monitors screen content for AI tool usage
- **Sensitive Data Protection**: Detects and warns about PII, API keys, passwords, and financial data
- **Prompt Quality Analysis**: Analyzes prompt effectiveness and provides improvement suggestions
- **Proactive Notifications**: Context-aware popups with actionable security and efficiency tips
- **Learning Opportunities**: Personalized coaching for better AI usage

### Smart Detection Engine
- **OCR Text Extraction**: Reads screen content to understand context
- **AI Tool Recognition**: Automatically detects ChatGPT, Claude, Copilot, and other AI services
- **Risk Assessment**: Real-time evaluation of data privacy and security risks
- **Content Analysis**: Identifies sensitive information patterns and compliance violations

### Coaching Features
- **Security Warnings**: Immediate alerts for critical data exposure risks
- **Efficiency Tips**: Suggestions for better tools and workflows
- **Prompt Engineering**: Guidance for writing more effective AI prompts
- **Library Recommendations**: Encourages sharing of innovative AI-generated solutions

### Enterprise Features
- **Multi-tenant Architecture**: Support for multiple organizations
- **SSO Integration**: SAML, OAuth, and Active Directory support
- **Policy Engine**: Customizable compliance rules and enforcement
- **Audit Logging**: Complete activity tracking for compliance

### Security & Privacy
- **Privacy-First Design**: All analysis happens locally on device
- **Zero-knowledge Architecture**: Sensitive content never stored or transmitted
- **Configurable Monitoring**: Granular control over what gets analyzed
- **SOC 2 Compliance**: Enterprise security standards

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/dam-desktop.git
cd dam-desktop
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

### Building for Production

```bash
# Build the application
npm run build

# Package for distribution
npm run package

# Create installers
npm run make
```

## Development

### Project Structure
```
src/
├── main/           # Main Electron process
├── renderer/       # React frontend
├── preload/        # Preload scripts
└── common/         # Shared services and utilities
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript check
- `npm run test` - Run tests (when implemented)

### Architecture

DAM Desktop follows a modular architecture:

- **Main Process**: Handles system integration, monitoring, and background services
- **Renderer Process**: React-based UI for dashboards and configuration
- **Preload Scripts**: Secure IPC communication between processes
- **Service Layer**: Database, monitoring, and AI detection services

## Quick Setup

### Prerequisites
- Node.js 18+ and npm
- API keys for OpenAI and Claude (optional for full functionality)

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/dam-security/dam-desktop.git
   cd dam-desktop
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

4. **Build and run**:
   ```bash
   npm run build
   npm start
   ```

### Development
```bash
npm run dev     # Start in development mode
npm run build   # Build for production
npm run make    # Create distributable packages
```

## Configuration

The application uses Electron Store for configuration management. Key settings include:

- **Monitoring**: Auto-start, intervals, capture settings
- **Privacy**: Data retention, anonymization options
- **Enterprise**: Organization settings, API endpoints
- **Alerts**: Thresholds and notification preferences

## Enterprise Deployment

### System Requirements
- **Windows**: 10/11 (64-bit)
- **macOS**: 10.14+ (Intel/Apple Silicon)
- **Linux**: Ubuntu 18.04+, CentOS 7+

### Installation Methods
- **MSI Installer**: Windows enterprise deployment
- **PKG Installer**: macOS deployment
- **DEB/RPM**: Linux package management
- **Group Policy**: Windows domain integration

### Permissions Required
- **Screen Recording**: For AI tool detection
- **Accessibility**: For application monitoring
- **Network Access**: For cloud sync and updates

## Security

### Data Protection
- Local SQLite database with encryption
- No sensitive content stored permanently
- Configurable data retention policies
- GDPR/CCPA compliant data handling

### Network Security
- TLS 1.3 for all communications
- Certificate pinning for API endpoints
- Proxy and firewall compatibility
- Enterprise security tool integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is proprietary software. See LICENSE file for details.

## Support

For technical support and enterprise inquiries:
- Email: support@dam.ai
- Documentation: https://docs.dam.ai
- Enterprise Sales: sales@dam.ai

## Roadmap

- [ ] Advanced AI model detection
- [ ] Real-time collaboration features
- [ ] Mobile companion app
- [ ] Advanced analytics dashboard
- [ ] Custom integrations API
- [ ] Automated policy recommendations