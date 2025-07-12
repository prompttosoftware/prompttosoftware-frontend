import React, { useState, useEffect } from 'react';
import { X, Github, Code, GitBranch, Layers, Zap } from 'lucide-react';

const WelcomeModal = ({ onClose, onLogin }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const handleLogin = () => {
    setIsVisible(false);
    setTimeout(onLogin, 300);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
      isVisible ? 'bg-black bg-opacity-50 backdrop-blur-sm' : 'bg-transparent'
    }`}>
      <div className={`relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300 transform ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 rounded-t-2xl">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Welcome to PromptToSoftware</h1>
              <p className="text-blue-100 text-lg">Transform your ideas into code with AI</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Turn your vision into reality
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Describe what you want to build, and our AI will create it in your GitHub repository. 
              No complex setup required – just tell us your idea and watch it come to life.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Github className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">GitHub Integration</h3>
                <p className="text-gray-600 text-sm">Creates projects directly in your GitHub repositories</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Multi-Repository Support</h3>
                <p className="text-gray-600 text-sm">Work on multiple repositories simultaneously</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Custom Development Setup</h3>
                <p className="text-gray-600 text-sm">Specify existing repos and development requirements</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Jira Integration</h3>
                <p className="text-gray-600 text-sm">Connect your Jira to track and edit AI tasks in real-time</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <button
              onClick={handleLogin}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get Started with GitHub
            </button>
            {/* <p className="text-gray-500 text-sm mt-3">
              Free to try • No credit card required
            </p> */}
          </div>

          {/* Browse Option */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
            >
              Or continue browsing to see how it works
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
