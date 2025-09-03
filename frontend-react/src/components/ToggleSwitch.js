import './ToggleSwitch.css';

const ToggleSwitch = ({ checked, onChange, disabled = false }) => {
  return (
    <label className={`toggle-switch ${disabled ? 'disabled' : ''}`}>
      <input 
        type="checkbox" 
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="slider"></span>
    </label>
  );
};

export default ToggleSwitch;