# Stripe Radar Fraud Detection Setup Guide

**Last Updated:** October 17, 2025
**Status:** Recommended for Production Deployment

---

## Overview

Stripe Radar is Stripe's advanced fraud detection and prevention system. It uses machine learning to identify and block suspicious transactions in real-time, protecting your business from chargebacks, fraud, and compliance issues.

For a pet adoption service like Exotic Bulldog Level, Radar provides:
- **Automatic fraud detection** for high-value deposits ($300)
- **Chargeback protection** from buyers claiming they didn't authorize the charge
- **Compliance monitoring** for suspicious patterns
- **Customizable rules** tailored to your business

---

## Why This Matters for Puppy Deposits

1. **High-Value Transactions**: $300 deposits are attractive targets for fraudsters
2. **Dispute Prevention**: Reduces "I didn't authorize this" chargebacks by 40%+
3. **Business Reputation**: Multiple chargebacks can flag your account with payment networks
4. **Trust**: Shows customers you take security seriously

**Real-world example:**
- Without Radar: A fraudster uses stolen card, makes $300 deposit, disputes it 2 weeks later
- Result: You lose $300 + chargeback fee + account flag
- With Radar: Transaction blocked before completion; zero loss

---

## Setup Instructions

### Step 1: Enable Radar in Stripe Dashboard

1. Go to **[Stripe Dashboard](https://dashboard.stripe.com)**
2. Log in to your Exotic Bulldog Level account
3. Navigate to **Radar** (left sidebar)
4. Click **Enable Radar**

### Step 2: Review Default Protection

Radar comes with default fraud rules. Review them:

1. In Radar, click **Rules**
2. Review "Default Rules" (automatically enabled)
3. Key default rules for pet industry:
   - Block if CVC verification fails
   - Block if postal code doesn't match
   - Block if velocity is suspicious (many transactions in short time)

**Keep these enabled** - they catch 70% of fraud attempts.

### Step 3: Create Custom Rules for Your Business

Custom rules protect against pet-specific fraud patterns.

#### Rule 1: Block High-Risk Velocity
```
Condition: If same card used >2 times in 1 hour
Action: BLOCK (prevent transaction)
Reason: Fraudsters often test multiple cards quickly
```

**Setup Steps:**
1. Click **Add Rule**
2. Select **Event Type**: `charge.created`
3. Conditions:
   - Card fingerprint matches
   - Created within 1 hour
   - Previous charge from same card exists
4. Action: **Block**
5. Save as "High Velocity Fraud Check"

#### Rule 2: Manual Review for High-Risk IPs
```
Condition: If country shows high fraud risk + amount > $250
Action: REVIEW (hold transaction for manual approval)
Reason: Catches international fraud attempts early
```

**Setup Steps:**
1. Click **Add Rule**
2. Select **Event Type**: `charge.created`
3. Conditions:
   - Amount > 25000 (cents) = $250
   - Country = High-risk countries (see list below)
4. Action: **Challenge** (requires manual approval)
5. Save as "International High-Value Review"

#### Rule 3: Block if Multiple Failures
```
Condition: If >3 failed attempts from same IP in 24 hours
Action: BLOCK (prevent all transactions from this IP)
Reason: Brute-force attack pattern
```

**Setup Steps:**
1. Click **Add Rule**
2. Select **Event Type**: `charge.failed`
3. Conditions:
   - IP address matches previous failures
   - Created within 24 hours
   - Failure count > 3
4. Action: **Block**
5. Save as "Multiple Failed Attempts Block"

---

## High-Risk Country Examples

Radar can block or review transactions from countries with higher fraud rates:

**Consider reviewing these:**
- Nigeria
- Russia
- Vietnam
- Ukraine
- Pakistan

**Why include them?** Not all transactions from these countries are fraudulent, but the fraud rate is statistically higher. Radar will still let legitimate customers through with additional verification.

---

## Machine Learning: Risk Scores

Radar automatically assigns each transaction a **Risk Score** (0-100):

- **0-25**: Low risk ✅ Auto-approve
- **26-50**: Medium risk ⚠️ Monitor
- **51-75**: High risk 🚩 Manual review
- **76-100**: Very high risk 🔴 Block

You can adjust thresholds for your business:

1. Go to **Radar** → **Settings**
2. Set **Default Action** based on risk score:
   - Risk Score 0-30: Allow
   - Risk Score 31-60: Challenge (manual review)
   - Risk Score 61+: Block

---

## Monitoring Radar Activity

### Daily: Check for Blocked Transactions

1. Go to **Radar** → **Blocked Charges**
2. Review any transactions blocked in the last 24 hours
3. **Action:** If legitimate customer was blocked:
   - Email them explaining why (fraud check)
   - Ask for verification (phone call, ID photo)
   - Manually approve if verified

### Weekly: Review Error Rates

1. Go to **Radar** → **Analytics**
2. Check:
   - **Block rate**: Should be 1-3% of all transactions
   - **Chargeback rate**: Should be < 0.5%
   - **False positive rate**: Should be < 20%

**If block rate is too high:**
- You may be losing legitimate customers
- Adjust rules to be less aggressive
- Add "Allow" exceptions for known customers

**If chargeback rate is too high:**
- Your rules aren't aggressive enough
- Enable additional fraud rules
- Consider requiring phone verification

---

## Integration with Your Checkout

**Good news:** No code changes needed!

Stripe Radar automatically:
1. Analyzes every Stripe Checkout transaction
2. Assigns risk scores in real-time
3. Blocks high-risk transactions before payment
4. Customer sees friendly error message

Your current Checkout Session code is fully compatible.

### What Customers See

**Low Risk (Approved):**
```
✅ Payment successful!
Session ID: cs_test_...
```

**High Risk (Blocked by Radar):**
```
❌ We couldn't process your payment.
Please contact support or try another payment method.
```

---

## Testing Radar Rules Locally

### Simulate Blocked Transaction (Stripe Test Mode)

Use test card: `4000000000000002` (blocked in test mode)

```bash
# Using Stripe CLI
stripe trigger charge.created \
  --override source.object=card \
  --override source.number=4000000000000002
```

### Simulate Review Needed

Use test card: `4000002500003155` (requires verification)

---

## Production Deployment Checklist

Before going live with Radar:

- [ ] All default fraud rules are enabled
- [ ] At least 3 custom rules are configured
- [ ] Risk score thresholds are set appropriately
- [ ] Alert emails are configured for blocked transactions
- [ ] Your team knows how to manually approve customers
- [ ] Customer support templates prepared for "Why was I blocked?"
- [ ] Monitoring dashboard is set up
- [ ] Chargeback rate is tracked (target: < 0.5%)

---

## Cost & Pricing

**Stripe Radar Pricing:**
- Radar Core (basic fraud detection): **Included free** with Stripe
- Radar Advanced (machine learning + custom rules): **$99/month** (optional)

**For Exotic Bulldog Level:**
- Start with **Radar Core** (included free)
- Upgrade to Advanced if chargeback rate increases

---

## Support & Troubleshooting

### Customer Reports: "Why was my transaction blocked?"

**Response Template:**
```
Hi [Customer Name],

Thank you for trying to reserve [Puppy Name]!

Your payment was declined by our fraud detection system to protect against unauthorized charges. This is a security measure.

Please try:
1. Using a different credit card
2. Calling your bank to ask about recent declines
3. Contacting us at [email] if you need assistance

We're here to help! Feel free to reach out.

Best regards,
Exotic Bulldog Level Team
```

### Debug High False Positive Rate

If many legitimate customers are blocked:

1. **Check Rule Conditions**: Are they too aggressive?
2. **Check Country Restrictions**: Are you blocking entire countries?
3. **Check Velocity Limits**: Are you blocking repeat customers?

**Solution:** Review Radar Analytics, identify patterns, and relax rules for legitimate customers.

---

## Best Practices

1. **Monitor Regularly**: Check Radar dashboard weekly
2. **Allow Whitelisting**: Remember customer IPs/cards for repeat purchases
3. **Manual Override**: Have process to approve blocked legitimate customers
4. **Customer Communication**: Explain why transactions are blocked
5. **Iterate**: Adjust rules based on real fraud patterns
6. **Document Decisions**: Keep notes on rule changes and their impact

---

## References

- [Stripe Radar Documentation](https://stripe.com/docs/radar)
- [Fraud Rules Guide](https://stripe.com/docs/radar/rules)
- [Risk Score Details](https://stripe.com/docs/radar/evaluating-risk)
- [Stripe Radar API](https://stripe.com/docs/api/radar)

---

## Next Steps

1. **Enable Radar in Dashboard** (Step 1 above)
2. **Review Default Rules** (already protecting you)
3. **Add 2-3 Custom Rules** (based on your patterns)
4. **Monitor for 1 Week** (watch for false positives)
5. **Fine-tune Rules** (adjust based on real data)
6. **Document Your Setup** (for team reference)

---

**Status**: ✅ Recommended for immediate implementation
**Effort**: ~15 minutes to enable + 30 minutes to configure rules
**ROI**: Prevents chargeback losses exceeding $100/month on average
