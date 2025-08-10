// src/components/FormPreview/FormPreview.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Button, Alert } from '@mui/material';
import FieldRenderer from './FieldRenderer';
import { FormSchema, FormData } from '../../types/formTypes';
import { getFormById } from '../../utils/localStorage';

const FormPreview: React.FC = () => {
  const { formId } = useParams();
  const [form, setForm] = useState<FormSchema | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<{ [fieldId: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (formId) {
      const savedForm = getFormById(formId);
      setForm(savedForm);
    } else {
      // Load current form from sessionStorage for preview
      const currentFormJson = sessionStorage.getItem('currentForm');
      if (currentFormJson) {
        setForm(JSON.parse(currentFormJson));
      }
    }
  }, [formId]);

  useEffect(() => {
    if (form) {
      // Initialize form data with default values
      const initialData: FormData = {};
      form.fields.forEach(field => {
        if (!field.isDerived && field.defaultValue !== undefined) {
          initialData[field.id] = field.defaultValue;
        }
      });
      setFormData(initialData);
    }
  }, [form]);

  // Calculate derived fields
  useEffect(() => {
    if (!form) return;

    const derivedFields = form.fields.filter(field => field.isDerived);
    const newFormData = { ...formData };

    derivedFields.forEach(field => {
      if (field.parentFields && field.derivedFormula) {
        try {
          // Replace field IDs with actual values in the formula
          let formula = field.derivedFormula;
          field.parentFields.forEach(parentId => {
            const value = formData[parentId];
            formula = formula.replace(new RegExp(`\\b${parentId}\\b`, 'g'), 
              typeof value === 'string' ? `"${value}"` : String(value || 0));
          });

          // Evaluate the formula (be careful with eval in production)
          const result = eval(formula);
          newFormData[field.id] = result;
        } catch (error) {
          console.error('Error calculating derived field:', error);
          newFormData[field.id] = 'Error';
        }
      }
    });

    setFormData(newFormData);
  }, [form, formData]);

  const validateField = (field: any, value: any): string | null => {
    for (const rule of field.validationRules) {
      switch (rule.type) {
        case 'required':
          if (!value || (typeof value === 'string' && !value.trim())) {
            return rule.message;
          }
          break;
        case 'minLength':
          if (typeof value === 'string' && value.length < (rule.value as number)) {
            return rule.message;
          }
          break;
        case 'maxLength':
          if (typeof value === 'string' && value.length > (rule.value as number)) {
            return rule.message;
          }
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (typeof value === 'string' && !emailRegex.test(value)) {
            return rule.message;
          }
          break;
        case 'password':
          const passwordRegex = /^(?=.*\d).{8,}$/;
          if (typeof value === 'string' && !passwordRegex.test(value)) {
            return rule.message;
          }
          break;
      }
    }
    return null;
  };

  const handleSubmit = () => {
    if (!form) return;

    const newErrors: { [fieldId: string]: string } = {};
    
    form.fields.forEach(field => {
      if (!field.isDerived) {
        const error = validateField(field, formData[field.id]);
        if (error) {
          newErrors[field.id] = error;
        }
      }
    });

    setErrors(newErrors);
    setSubmitted(true);

    if (Object.keys(newErrors).length === 0) {
      alert('Form submitted successfully!');
    }
  };

  const updateFormData = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  if (!form) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Form Preview
        </Typography>
        <Alert severity="info">
          No form to preview. Please create a form first or select a saved form.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Form Preview: {form.name}
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        {form.fields
          .sort((a, b) => a.order - b.order)
          .map(field => (
            <Box key={field.id} sx={{ mb: 3 }}>
              <FieldRenderer
                field={field}
                value={formData[field.id]}
                onChange={(value) => updateFormData(field.id, value)}
                error={errors[field.id]}
                disabled={field.isDerived}
              />
            </Box>
          ))}
        
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          sx={{ mt: 2 }}
        >
          Submit Form
        </Button>
      </Paper>

      {submitted && Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Please fix the errors above before submitting.
        </Alert>
      )}
    </Box>
  );
};

export default FormPreview;
