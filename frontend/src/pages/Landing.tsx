// src/pages/Landing.tsx
import { Link } from 'react-router-dom';
import { Activity, Shield, Bell, BarChart3, MessageSquare, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';

export const Landing = () => {
  const features = [
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Smart Reminders',
      description: 'Never miss a dose with intelligent, personalized medication reminders.',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Adherence Tracking',
      description: 'Monitor your medication compliance with detailed analytics and insights.',
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'AI Assistant',
      description: 'Get instant answers about medications, side effects, and interactions.',
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Schedule Management',
      description: 'Organize your medication schedule with an intuitive calendar interface.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Private',
      description: 'Your health data is encrypted and HIPAA-compliant for complete security.',
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: 'Health Insights',
      description: 'Receive personalized health recommendations based on your medication history.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MediTrack AI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Personal
              <span className="text-blue-600"> Medication</span>
              <br />
              Management Assistant
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Track medications, receive smart reminders, and improve adherence with AI-powered insights.
              Take control of your health journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight size={20} />}>
                  Start Free Trial
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Stay Healthy
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive medication management tools designed for patients and healthcare providers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 bg-white"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Health Management?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of patients and healthcare providers using MediTrack AI.
            </p>
            <Link to="/register">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
                rightIcon={<ArrowRight size={20} />}
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">MediTrack AI</span>
          </div>
          <p className="text-gray-400 mb-4">
            Empowering patients with intelligent medication management.
          </p>
          <p className="text-sm text-gray-500">
            © 2024 MediTrack AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};