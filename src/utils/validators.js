export const validators = {
  required: (val) => {
    if (!val || !String(val).trim()) return 'This field is required'
    return null
  },
  email: (val) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!val) return 'Email is required'
    if (!re.test(val)) return 'Enter a valid email address'
    return null
  },
  minLength: (min) => (val) => {
    if (!val || val.length < min) return `Must be at least ${min} characters`
    return null
  },
  maxLength: (max) => (val) => {
    if (val && val.length > max) return `Must be at most ${max} characters`
    return null
  },
  password: (val) => {
    if (!val) return 'Password is required'
    if (val.length < 6) return 'Password must be at least 6 characters'
    return null
  },
  confirmPassword: (password) => (val) => {
    if (val !== password) return 'Passwords do not match'
    return null
  },
  phone: (val) => {
    if (!val) return null
    const re = /^\+?[\d\s\-().]{7,15}$/
    if (!re.test(val)) return 'Enter a valid phone number'
    return null
  },
}

export function validate(fields, rules) {
  const errors = {}
  for (const key in rules) {
    const ruleList = Array.isArray(rules[key]) ? rules[key] : [rules[key]]
    for (const rule of ruleList) {
      const error = rule(fields[key])
      if (error) { errors[key] = error; break }
    }
  }
  return errors
}