import React, { useState } from 'react';
import { Mail, Lock, Phone, UserCircle, Activity, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import { UserRole } from '../../types';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'patient' as UserRole
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validation logic
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@gmail\.com$/.test(formData.email)) newErrors.email = 'Only Gmail addresses (@gmail.com) are allowed';
    else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.email)) newErrors.email = 'Invalid Gmail format';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else {
      // Validate Moroccan phone number format
      const moroccanPhoneRegex = /^(\+212|0)[5-7]\d{8}$/;
      if (!moroccanPhoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Invalid Moroccan phone number. Format: +212XXXXXXXXX or 0XXXXXXXXX (must start with 5, 6, or 7)';
      }
    }
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      });
      navigate('/login');
    } catch (error: any) {
      setErrors({ general: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg">
        <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
          <ArrowLeft size={18} /> Back to Login
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500 mt-2">Join MediTrack AI to manage your health journey</p>
        </div>

        <Card className="shadow-xl border-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              error={errors.fullName}
              icon={<UserCircle size={20} />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your Gmail address (@gmail.com only)"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              icon={<Mail size={20} />}
              required
            />

            <div>
              <Input
                label="Phone Number (Moroccan)"
                type="tel"
                placeholder="+212XXXXXXXXX or 0XXXXXXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={errors.phone}
                icon={<Phone size={20} />}
                required
              />
              <p className="text-xs text-slate-500 mt-1">Format: +212 followed by 9 digits starting with 5, 6, or 7</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                icon={<Lock size={20} />}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                error={errors.confirmPassword}
                icon={<Lock size={20} />}
                required
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Account Type</label>
              <div className="grid grid-cols-2 gap-4">
                {['patient', 'admin'].map((role) => (
                  <label
                    key={role}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200
                      ${formData.role === role 
                        ? 'bg-blue-50 border-[#2A7EF0] text-[#2A7EF0]' 
                        : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={formData.role === role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                      className="hidden"
                    />
                    <span className="capitalize font-medium">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" fullWidth isLoading={isLoading} className="mt-4">
              Create Account
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;