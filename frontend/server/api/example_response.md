Based on my analysis of the Chatwoot codebase, here's where the `CAPTAIN.ENTERPRISE_PAYWALL.AVAILABLE_ON` constant is checked and how paid subscriptions affect Captain AI functionality:

## Where the Constant is Checked

The `CAPTAIN.ENTERPRISE_PAYWALL.AVAILABLE_ON` constant is checked in the **BasePaywallModal** component, which is the core paywall interface used throughout the Captain AI modules. [1](#2-0) 

This constant is dynamically referenced using the pattern `${featurePrefix}.${i18nKey}.AVAILABLE_ON`, where `featurePrefix` is "CAPTAIN" and `i18nKey` can be either "PAYWALL" or "ENTERPRISE_PAYWALL" depending on the installation type. [2](#2-1) 

The constant itself is defined in the internationalization files with the message "Captain is not available on the free plan." [3](#2-2) 

## Paywall Logic and Subscription Checks

The core paywall logic is handled by the **usePolicy** composable, specifically through the `shouldShowPaywall` function. [4](#2-3) 

Captain AI is defined as a premium feature in the feature flags configuration. [5](#2-4) 

## How Paid Subscriptions Affect Captain AI Availability

### 1. Feature Availability Check
Captain AI availability is determined through the `captainEnabled` computed property, which checks if the Captain feature flag is enabled for the current account. [6](#2-5) 

### 2. Plan-Based Limits
For accounts with paid subscriptions, Captain AI functionality is governed by usage limits defined in the account's plan. These limits include:
- Document limits for knowledge base uploads
- Response limits for AI-generated responses [7](#2-6) 

### 3. Usage Tracking
The system tracks Captain AI usage through:
- Response usage incrementation [8](#2-7) 
- Document usage tracking [9](#2-8) 

### 4. Paywall Display Logic
The paywall is displayed in Captain AI pages through the **PageLayout** component, which uses the `shouldShowPaywall` function to determine when to show the paywall instead of the actual content. [10](#2-9) 

When the paywall is active, users see the `CaptainPaywall` component instead of the Captain AI features. [11](#2-10) 

### 5. Plan Configuration
The default Captain limits are configured through installation settings, with different limits for different plan tiers. Free plans typically receive zero limits, while paid plans receive allocated quotas. [12](#2-11) 

## Notes

The Captain AI paywall system works differently depending on the installation type:
- **Cloud installations**: Show upgrade prompts directing users to billing
- **Enterprise installations**: Show messages asking users to contact their administrator
- **Custom branded instances**: Never show paywalls

The system ensures that Captain AI features (assistants, copilot, document management, and automated responses) are only available to users with appropriate paid subscriptions, while providing clear upgrade paths for free tier users.