# ADR-005: Premium Tier Subscription Model

**Status:** Accepted
**Date:** 2025-11-14
**Decision Makers:** Vladimir K.S.
**Related Issues:** Monetization strategy

---

## Context

CCM provides value through curated artifacts (skills, commands, agents) for Claude Code. Considerations:

- Ongoing development and maintenance costs
- Community expects free core functionality
- Professional users need advanced features
- Sustainable funding required for long-term development

Goals:
- Free tier sufficient for casual users
- Premium tier provides significant value
- Clear value proposition
- Fair pricing
- Easy activation

---

## Decision

Implement **three-tier subscription model**:

### Tier 1: FREE (Community)

**What's Included:**
- Core essentials package (managing-claude-context skill)
- Basic commands and tools
- Community support (GitHub Issues)
- Access to all documentation
- Updates and bug fixes

**Target Audience:** Casual users, students, experimenters

**Pricing:** $0/month (always free)

### Tier 2: PREMIUM ($9/month)

**What's Included:**
- All FREE tier features
- Professional skills, commands, and agents
- Priority support (email, dedicated channel)
- Regular updates with new packages
- Advanced features:
  - Custom artifact creation tools
  - Enhanced automation
  - Team collaboration features (limited)

**Target Audience:** Professional developers, consultants, power users

**Pricing:** $9/month or $90/year (save $18)

###  Tier 3: TEAM ($29/month for 5 users)

**What's Included:**
- All PREMIUM features
- Team collaboration:
  - Shared package libraries
  - Team-wide artifact distribution
  - Centralized license management
- Team training and onboarding resources
- Priority support with SLA

**Target Audience:** Development teams, agencies, small companies

**Pricing:** $29/month for up to 5 users ($5.80/user)

---

## License Activation

### Activation Flow

```bash
# User purchases license → receives activation key
$ ccm activate PREMIUM_KEY_ABC123

Activating license...
✓ License activated successfully

Tier: PREMIUM Individual
Valid until: 2026-11-15
Email: user@example.com

Premium artifacts now available!
Run 'ccm list' to see full catalog.
```

### License Validation

- **Online validation:** Check with license server on activation
- **Offline grace period:** 30 days without internet
- **License storage:** Encrypted in `~/.claude-context-manager/config.json`
- **License transfer:** Deactivate on old machine, activate on new

### Premium Artifact Access

**Before Activation:**
```
$ ccm list

Available Artifacts (Free Tier):
  ✓ managing-claude-context (v0.1.0)

Premium Artifacts:
  🔒 advanced-pdf (v1.0.0)       [LOCKED]
  🔒 enterprise-automation (v1.2.0) [LOCKED]

Run "ccm activate LICENSE_KEY" to unlock
```

**After Activation:**
```
$ ccm list

Available Artifacts (Premium Tier):
  ✓ managing-claude-context (v0.1.0)
  advanced-pdf (v1.0.0)
  enterprise-automation (v1.2.0)
  ... +15 premium artifacts
```

---

## Consequences

### Positive

- **Sustainable Development:** Recurring revenue supports ongoing work
- **Free Core:** Ensures accessibility for all users
- **Clear Value:** Premium tier offers tangible benefits
- **Fair Pricing:** Comparable to other dev tools ($9-15/month standard)
- **Team Options:** Makes sense for organizations

### Negative

- **Support Burden:** Premium users expect faster support
- **Content Creation:** Need to regularly create premium artifacts
- **Piracy Risk:** License keys could be shared
- **Marketing Required:** Need to communicate value proposition

### Mitigations

- **Support Tier:** Premium support via email (manageable volume)
- **Content Pipeline:** Create 2-3 premium artifacts per month
- **License Validation:** Online check + device fingerprinting
- **Value Communication:** Clear documentation of premium benefits

---

## Premium Content Strategy

### Content Types

**Skills (High Value):**
- Advanced PDF processing (OCR, forms, security)
- Enterprise automation workflows
- Multi-agent orchestration
- Custom context engineering tools

**Commands (Medium Value):**
- Team collaboration commands
- Advanced analysis tools
- Workflow automation
- Custom generators

**Agents (High Value):**
- Specialized domain experts
- Code review agents
- Documentation generators
- Quality assurance agents

### Release Cadence

- **Free tier:** 1-2 new artifacts per quarter
- **Premium tier:** 2-3 new artifacts per month
- **Updates:** Bug fixes and improvements for all tiers

---

## License Server Implementation

**Not Yet Implemented** - Future consideration:

### Architecture

```
License Server (Future):
- REST API for activation/validation
- Database: Users, licenses, subscriptions
- Stripe integration for payments
- Email notifications
- Usage analytics
```

### Current Implementation (v0.3.7)

**Simplified approach:**
- Premium artifacts exist in codebase
- Locked by default
- `ccm activate` command exists but not functional
- Display "Coming soon Q1 2025" message

**Placeholder Activation:**
```javascript
// src/commands/activate.js
async function activate(args) {
  console.log('Premium tier launching Q1 2025!');
  console.log('Early access: vlad@vladks.com');
}
```

---

## Future Enhancements

### Enterprise Tier (Custom Pricing)

- On-premises deployment
- Custom artifact development
- Dedicated support with SLA
- Training and consulting
- White-label options

### Educational Discounts

- 50% off for students (.edu email)
- Free for open-source projects
- Classroom licenses for educators

### Affiliate Program

- 20% commission for referrals
- Custom affiliate links
- Monthly payouts

---

## Pricing Rationale

**Market Analysis:**
- GitHub Copilot: $10/month
- Cursor Pro: $20/month
- JetBrains: $8-25/month per product
- Grammarly Premium: $12/month

**Our Pricing:**
- **FREE:** $0 (core value free forever)
- **PREMIUM:** $9/month (competitive, below average)
- **TEAM:** $29/5 users = $5.80/user (volume discount)

**Justification:**
- Lower than most dev tools
- Significant free tier
- Clear value proposition
- Sustainable for ongoing development

---

## References

- Implementation: `src/commands/activate.js`
- Premium catalog: `packages/premium/` (future)
- License server: (not yet implemented)

---

## Revision History

- **2025-11-14:** Initial decision
- **2025-11-20:** Documented as ADR-005
- **Future:** License server implementation (Q1 2025)
