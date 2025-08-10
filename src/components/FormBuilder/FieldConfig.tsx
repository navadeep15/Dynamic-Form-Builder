// src/components/FormBuilder/FieldConfig.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { FormField, ValidationRule } from '../../types/formTypes';

interface FieldConfigProps {
  field: FormField;
  allFields: FormField[];
  open: boolean;
  onClose: () => void;
  onSave: (field: FormField) => void;
}

const FieldConfig: React.FC<FieldConfigProps> = ({ field, allFields, open, onClose, onSave }) => {
  const [editedField, setEditedField] = useState<FormField>(field);
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    setEditedField(field);
  }, [field]);

  const handleSave = () => {
    onSave(editedField);
  };

  const addValidationRule = (type: ValidationRule['type']) => {
    const newRule: ValidationRule = {
      type,
      message: `Please enter a valid ${type}`,
      value: type === 'minLength' || type === 'maxLength' ? 1 : undefined,
    };
    
    setEditedField({
      ...editedField,
      validationRules: [...editedField.validationRules, newRule],
    });
  };

  const removeValidationRule = (index: number) => {
    setEditedField({
      ...editedField,
      validationRules: editedField.validationRules.filter((_, i) => i !== index),
    });
  };

  const updateValidationRule = (index: number, updates: Partial<ValidationRule>) => {
    setEditedField({
      ...editedField,
      validationRules: editedField.validationRules.map((rule, i) =>
        i === index ? { ...rule, ...updates } : rule
      ),
    });
  };

  const addOption = () => {
    if (newOption.trim()) {
      setEditedField({
        ...editedField,
        options: [...(editedField.options || []), newOption.trim()],
      });
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setEditedField({
      ...editedField,
      options: editedField.options?.filter((_, i) => i !== index),
    });
  };

  const hasOptionsField = ['select', 'radio', 'checkbox'].includes(editedField.type);
  const availableParentFields = allFields.filter(f => f.id !== editedField.id && !f.isDerived);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Configure Field: {editedField.label}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Basic Configuration */}
          <TextField
            label="Label"
            value={editedField.label}
            onChange={(e) => setEditedField({ ...editedField, label: e.target.value })}
            fullWidth
          />

          <FormControlLabel
            control={
              <Switch
                checked={editedField.required}
                onChange={(e) => setEditedField({ ...editedField, required: e.target.checked })}
              />
            }
            label="Required"
          />

          <TextField
            label="Default Value"
            value={editedField.defaultValue}
            onChange={(e) => setEditedField({ ...editedField, defaultValue: e.target.value })}
            fullWidth
          />

          {/* Options for select, radio, checkbox */}
          {hasOptionsField && (
            <Box>
              <Typography variant="h6">Options</Typography>
              {editedField.options?.map((option, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TextField
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(editedField.options || [])];
                      newOptions[index] = e.target.value;
                      setEditedField({ ...editedField, options: newOptions });
                    }}
                    size="small"
                    fullWidth
                  />
                  <Button onClick={() => removeOption(index)} color="error">
                    Remove
                  </Button>
                </Box>
              ))}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="New Option"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  size="small"
                  onKeyPress={(e) => e.key === 'Enter' && addOption()}
                />
                <Button onClick={addOption}>Add</Button>
              </Box>
            </Box>
          )}

          {/* Derived Field Configuration */}
          <FormControlLabel
            control={
              <Switch
                checked={editedField.isDerived || false}
                onChange={(e) => setEditedField({ 
                  ...editedField, 
                  isDerived: e.target.checked,
                  parentFields: e.target.checked ? [] : undefined,
                  derivedFormula: e.target.checked ? '' : undefined,
                })}
              />
            }
            label="Derived Field"
          />

          {editedField.isDerived && (
            <Box>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Parent Fields</InputLabel>
                <Select
                  multiple
                  value={editedField.parentFields || []}
                  onChange={(e) => setEditedField({ 
                    ...editedField, 
                    parentFields: e.target.value as string[] 
                  })}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => {
                        const parentField = availableParentFields.find(f => f.id === value);
                        return <Chip key={value} label={parentField?.label || value} />;
                      })}
                    </Box>
                  )}
                >
                  {availableParentFields.map((parentField) => (
                    <MenuItem key={parentField.id} value={parentField.id}>
                      <Checkbox checked={(editedField.parentFields || []).indexOf(parentField.id) > -1} />
                      <ListItemText primary={parentField.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Formula (e.g., field1 + field2, or use JavaScript expressions)"
                value={editedField.derivedFormula || ''}
                onChange={(e) => setEditedField({ 
                  ...editedField, 
                  derivedFormula: e.target.value 
                })}
                fullWidth
                multiline
                rows={2}
                helperText="Use field IDs in your formula. Example: for age calculation use: new Date().getFullYear() - new Date(field1).getFullYear()"
              />
            </Box>
          )}

          {/* Validation Rules */}
          {!editedField.isDerived && (
            <Box>
              <Typography variant="h6">Validation Rules</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                <Button size="small" onClick={() => addValidationRule('required')}>
                  Required
                </Button>
                <Button size="small" onClick={() => addValidationRule('minLength')}>
                  Min Length
                </Button>
                <Button size="small" onClick={() => addValidationRule('maxLength')}>
                  Max Length
                </Button>
                <Button size="small" onClick={() => addValidationRule('email')}>
                  Email
                </Button>
                <Button size="small" onClick={() => addValidationRule('password')}>
                  Password
                </Button>
              </Box>

              {editedField.validationRules.map((rule, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip label={rule.type} />
                  {(rule.type === 'minLength' || rule.type === 'maxLength') && (
                    <TextField
                      type="number"
                      label="Value"
                      value={rule.value || ''}
                      onChange={(e) => updateValidationRule(index, { value: parseInt(e.target.value) })}
                      size="small"
                      sx={{ width: 100 }}
                    />
                  )}
                  <TextField
                    label="Error Message"
                    value={rule.message}
                    onChange={(e) => updateValidationRule(index, { message: e.target.value })}
                    size="small"
                    fullWidth
                  />
                  <Button onClick={() => removeValidationRule(index)} color="error">
                    Remove
                  </Button>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FieldConfig;
