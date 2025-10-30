---
description: Perform a comprehensive security review of the codebase
---

# Security Review

You are performing a comprehensive security audit of this codebase. Your goal is to identify potential security vulnerabilities, insecure practices, and provide actionable remediation recommendations.

## Scope of Review

Analyze the codebase for the following security concerns:

### 1. **Authentication & Authorization**
- Check for proper authentication mechanisms
- Verify authorization checks before sensitive operations
- Look for session management issues
- Check for insecure direct object references (IDOR)
- Verify proper role-based access control (RBAC)

### 2. **Input Validation & Injection Attacks**
- SQL Injection vulnerabilities
- NoSQL Injection vulnerabilities
- Cross-Site Scripting (XSS) - reflected, stored, and DOM-based
- Command Injection
- Path Traversal
- XML/XXE Injection
- LDAP Injection
- Template Injection

### 3. **Sensitive Data Exposure**
- Hardcoded secrets, API keys, passwords, or credentials
- Sensitive data in logs
- Insecure data storage (localStorage, sessionStorage for sensitive data)
- Missing encryption for sensitive data at rest and in transit
- Exposure of sensitive data in URLs or error messages
- Check .env files, configuration files, and comments for leaked secrets

### 4. **API Security**
- Missing or improper CORS configuration
- API rate limiting
- Missing authentication on API endpoints
- Excessive data exposure in API responses
- API versioning issues
- GraphQL specific issues (depth limiting, query complexity)

### 5. **Cryptography Issues**
- Use of weak or deprecated cryptographic algorithms
- Insecure random number generation
- Improper key management
- Missing or weak hashing for passwords
- Insecure SSL/TLS configuration

### 6. **Client-Side Security (Frontend)**
- Cross-Site Scripting (XSS) vulnerabilities
- Cross-Site Request Forgery (CSRF) protection
- Clickjacking protection (X-Frame-Options, CSP)
- Insecure use of `eval()`, `dangerouslySetInnerHTML`, or similar
- Content Security Policy (CSP) implementation
- Subresource Integrity (SRI) for external scripts

### 7. **Dependency Security**
- Outdated dependencies with known vulnerabilities
- Use of deprecated packages
- Check package.json and lock files
- Recommend running `npm audit` or `yarn audit`

### 8. **Server-Side Security (Backend)**
- Server-side request forgery (SSRF)
- Remote code execution vulnerabilities
- File upload vulnerabilities
- Insecure deserialization
- XML External Entity (XXE) attacks
- Server misconfigurations

### 9. **Access Control & Permissions**
- Broken access control
- Missing function level access control
- Insecure file permissions
- Privilege escalation vulnerabilities

### 10. **Error Handling & Logging**
- Sensitive information in error messages
- Insufficient logging and monitoring
- Stack traces exposed to users
- Missing security event logging

### 11. **Business Logic Flaws**
- Race conditions
- Time-of-check to time-of-use (TOCTOU) issues
- Bypass of business logic through parameter manipulation
- Insecure workflow implementations

### 12. **Infrastructure & Deployment**
- Exposed debug endpoints or development artifacts
- Insecure CI/CD configurations
- Docker/container security issues
- Environment variable handling
- Default credentials or configurations

## Review Process

1. **Automated Scan**: First, search for common vulnerability patterns across the codebase using grep/glob
2. **Manual Code Review**: Examine critical files for security issues:
   - Authentication/authorization code
   - API endpoints and route handlers
   - Database queries and data access layers
   - User input handling and validation
   - Configuration files
   - Environment variable usage
   - Third-party integrations

3. **Dependency Analysis**: Check package.json and suggest running security audits

4. **Documentation Review**: Check for security-related documentation and best practices

## Output Format

Provide your findings in the following structured format:

### 🔴 Critical Issues (Immediate Action Required)
List any critical vulnerabilities that could lead to:
- Remote code execution
- Authentication bypass
- Data breaches
- Privilege escalation

**For each issue:**
- **File/Location**: `path/to/file.ts:line_number`
- **Vulnerability Type**: [Type of vulnerability]
- **Description**: Clear explanation of the issue
- **Risk Level**: Critical
- **Proof of Concept**: How this could be exploited
- **Remediation**: Specific code changes or steps to fix

### 🟠 High Priority Issues (Should Fix Soon)
List high-risk issues like:
- XSS vulnerabilities
- Weak authentication
- Insecure data storage
- Missing CSRF protection

**Same format as Critical Issues**

### 🟡 Medium Priority Issues (Should Address)
List medium-risk issues like:
- Missing input validation
- Information disclosure
- Weak session management
- Missing security headers

**Same format as Critical Issues**

### 🟢 Low Priority Issues (Best Practices)
List low-risk issues and security improvements:
- Code quality issues that could lead to security problems
- Missing security documentation
- Recommended security enhancements

**Same format as Critical Issues**

### ✅ Positive Security Practices Found
List good security practices already implemented in the codebase

### 📋 Recommendations
1. **Immediate Actions**: What needs to be done right now
2. **Short-term Improvements**: Security enhancements for the next sprint
3. **Long-term Strategy**: Security architecture recommendations
4. **Security Tools**: Recommend tools to integrate (linters, SAST, DAST, dependency scanners)
5. **Security Training**: Topics the team should learn about

### 📊 Security Score
Provide an overall security score (1-10) with justification based on findings.

## Important Notes

- **Be thorough but practical**: Focus on real vulnerabilities, not theoretical issues
- **Provide context**: Explain why something is a security risk
- **Actionable advice**: Always provide specific remediation steps
- **Code examples**: Show secure code examples when recommending fixes
- **Consider the stack**: Tailor recommendations to the technologies used (React, Node.js, etc.)
- **Risk assessment**: Help prioritize fixes based on actual risk and exploitability
- **False positives**: If something looks suspicious but is actually safe, explain why

## Begin Security Review

Start your security review now. Use the Explore agent or search tools to thoroughly examine the codebase, then provide a comprehensive security report following the format above.
