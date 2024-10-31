
const PasswordCriteria = ({password}) => {
  const criteria = [
    { label: "At least 6 characters", met: password.length >= 6},
  ]
}

const PasswordStrengthMeter = () => {
  return (
    <div>PasswordStrengthMeter</div>
  )
}

export default PasswordStrengthMeter