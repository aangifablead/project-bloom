import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-info relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-24 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold">ProjectFlow</span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Manage your projects with confidence
            </h1>
            
            <p className="text-lg text-primary-foreground/80 mb-12 max-w-md">
              Streamline your workflow, collaborate seamlessly, and deliver projects on time with our powerful project management platform.
            </p>
            
            <div className="flex items-center gap-8">
              <div>
                <div className="text-3xl font-bold">10k+</div>
                <div className="text-primary-foreground/70">Active Users</div>
              </div>
              <div className="w-px h-12 bg-primary-foreground/20" />
              <div>
                <div className="text-3xl font-bold">50k+</div>
                <div className="text-primary-foreground/70">Projects</div>
              </div>
              <div className="w-px h-12 bg-primary-foreground/20" />
              <div>
                <div className="text-3xl font-bold">99.9%</div>
                <div className="text-primary-foreground/70">Uptime</div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-info/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-bl from-primary-foreground/10 to-transparent rounded-full blur-2xl" />
      </div>
      
      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
};
