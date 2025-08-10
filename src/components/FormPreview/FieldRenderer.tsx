// src/components/FormPreview/FieldRenderer.tsx
import React from 'react';
import {
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormHelperText,
  InputLabel,
} from '@mui/material';
import { FormField } from '../../types/formTypes';

interface FieldRendererProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({ 
  field, 
  value, 
  onChange, 
  error, 
  disabled = false 
}) => {
  const hasError = Boolean(error);

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <TextField
            label={field.label}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            error={hasError}
            helperText={error}
            fullWidth
            disabled={disabled}
          />
        );

      case 'number':
        return (
          <TextField
            label={field.label}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            error={hasError}
            helperText={error}
            fullWidth
            disabled={disabled}
          />
        );

      case 'textarea':
        return (
          <TextField
            label={field.label}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            error={hasError}
            helperText={error}
            fullWidth
            multiline
            rows={4}
            disabled={disabled}
          />
        );

      case 'date':
        return (
          <TextField
            label={field.label}
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            error={hasError}
            helperText={error}
            fullWidth
            InputLabelProps={{ shrink: true }}
            disabled={disabled}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth error={hasError} disabled={disabled}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              label={field.label}
            >
              {field.options?.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case 'radio':
        return (
          <FormControl error={hasError} disabled={disabled}>
            <FormLabel component="legend">{field.label}</FormLabel>
            <RadioGroup
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            >
              {field.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControl error={hasError} disabled={disabled}>
            <FormLabel component="legend">{field.label}</FormLabel>
            <FormGroup>
              {field.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={(value || []).includes(option)}
                      onChange={(e) => {
                        const currentValues = value || [];
                        if (e.target.checked) {
                          onChange([...currentValues, option]);
                        } else {
                          onChange(currentValues.filter((v: string) => v !== option));
                        }
                      }}
                    />
                  }
                  label={option}
                />
              ))}
            </FormGroup>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );

      default:
        return null;
    }
  };

  return <div>{renderField()}</div>;
};

export default FieldRenderer;
