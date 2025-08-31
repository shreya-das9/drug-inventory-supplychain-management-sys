import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, Mail, Phone, Building, FileText } from 'lucide-react';

export default function SignupForm({ onSignup, isLoading, error, onSwitchToLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    role: 'USER', phone: '', companyName: '', licenseNumber: '',
    address: { street: '', city: '', state: '', zipCode: '', country: '' }
  });

  const setField = (name, value) => setForm(f => ({...f, [name]: value}));
  const setAddress = (name, value) => setForm(f => ({...f, address: {...f.address, [name]: value}}));

  const submit = (e) => {
    e.preventDefault();
    onSignup(form);
  };

  const showCompany = form.role === 'WAREHOUSE' || form.role === 'RETAILER';
  const showLicense = form.role === 'RETAILER';

  return (
    <div style={{minHeight:'100vh'}} className="flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-2xl bg-white border rounded-xl p-6 shadow">
        <h2 className="text-2xl font-bold mb-1">Create your account</h2>
        <p className="text-sm text-gray-500 mb-6">Join our Drug Inventory Supply Chain</p>

        {error ? <div className="mb-4 text-red-600 text-sm">{error}</div> : null}

        <form onSubmit={submit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input className="w-full border rounded-md pl-10 pr-3 py-2" placeholder="First name" required
                value={form.firstName} onChange={e => setField('firstName', e.target.value)} />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input className="w-full border rounded-md pl-10 pr-3 py-2" placeholder="Last name" required
                value={form.lastName} onChange={e => setField('lastName', e.target.value)} />
            </div>
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input className="w-full border rounded-md pl-10 pr-3 py-2" type="email" placeholder="Email" required
              value={form.email} onChange={e => setField('email', e.target.value)} />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input className="w-full border rounded-md pl-10 pr-10 py-2"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (6+ chars, upper/lower/number)" required
              value={form.password} onChange={e => setField('password', e.target.value)} />
            <button type="button" className="absolute right-3 top-3" onClick={() => setShowPassword(s => !s)}>
              {showPassword ? <EyeOff className="h-4 w-4 text-gray-500"/> : <Eye className="h-4 w-4 text-gray-500"/>}
            </button>
          </div>

          <div>
            <select className="w-full border rounded-md px-3 py-2" value={form.role}
              onChange={e => setField('role', e.target.value)}>
              <option value="USER">End User</option>
              <option value="RETAILER">Retailer / Pharmacy</option>
              <option value="WAREHOUSE">Warehouse Manager</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          {showCompany && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input className="w-full border rounded-md pl-10 pr-3 py-2" placeholder="Company name" required
                  value={form.companyName} onChange={e => setField('companyName', e.target.value)} />
              </div>
              {showLicense && (
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input className="w-full border rounded-md pl-10 pr-3 py-2" placeholder="License number" required
                    value={form.licenseNumber} onChange={e => setField('licenseNumber', e.target.value)} />
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input className="w-full border rounded-md pl-10 pr-3 py-2" placeholder="Phone"
                value={form.phone} onChange={e => setField('phone', e.target.value)} />
            </div>
            <input className="w-full border rounded-md px-3 py-2" placeholder="Street"
              value={form.address.street} onChange={e => setAddress('street', e.target.value)} />
            <input className="w-full border rounded-md px-3 py-2" placeholder="City"
              value={form.address.city} onChange={e => setAddress('city', e.target.value)} />
            <input className="w-full border rounded-md px-3 py-2" placeholder="State"
              value={form.address.state} onChange={e => setAddress('state', e.target.value)} />
            <input className="w-full border rounded-md px-3 py-2" placeholder="ZIP"
              value={form.address.zipCode} onChange={e => setAddress('zipCode', e.target.value)} />
            <input className="w-full border rounded-md px-3 py-2" placeholder="Country"
              value={form.address.country} onChange={e => setAddress('country', e.target.value)} />
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full py-2 rounded-md bg-emerald-600 text-white disabled:opacity-60">
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>

          <div className="text-center">
            <button type="button" onClick={onSwitchToLogin} className="text-emerald-700">
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
