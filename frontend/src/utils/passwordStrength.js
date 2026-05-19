export const calculatePasswordStrength = (pass) => {
  let strength = 0;
  if (pass.length >= 8) strength += 25;
  if (pass.match(/[a-z]/)) strength += 25;
  if (pass.match(/[A-Z]/)) strength += 25;
  if (pass.match(/[0-9]/)) strength += 12.5;
  if (pass.match(/[@$!%*?&]/)) strength += 12.5;
  return Math.min(strength, 100);
};

export const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, text: "حداقل ۸ کاراکتر" },
  { regex: /[a-z]/, text: "یک حرف کوچک" },
  { regex: /[A-Z]/, text: "یک حرف بزرگ" },
  { regex: /[0-9]/, text: "یک عدد" },
  { regex: /[@$!%*?&]/, text: "یک کاراکتر خاص" },
];
