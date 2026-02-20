# FraudLabs Pro CLI - Agent Instructions

This CLI provides access to the FraudLabs Pro SMS Verification API for sending and verifying OTP codes.

## Common Tasks

**Configure API key:**
```bash
fraudlabspro config set --api-key YOUR_API_KEY
```

**Send verification code:**
```bash
fraudlabspro send --tel +12025550123
```

**Send with custom message:**
```bash
fraudlabspro send --tel +12025550123 --mesg "Your verification code is <otp>"
```

**Verify OTP code:**
```bash
fraudlabspro verify --tran-id abc123 --otp 123456
```

## Output Modes

- Default: Human-readable formatted output
- `--json`: Machine-readable JSON output

## Notes

- Requires FraudLabs Pro API key (get one at https://www.fraudlabspro.com)
- Phone numbers must be in E164 format: +[country code][number]
- API key can be configured globally or passed per-request with `--key`
- Perfect for user authentication and fraud prevention workflows
