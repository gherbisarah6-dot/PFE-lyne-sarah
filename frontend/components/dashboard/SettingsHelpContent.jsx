'use client';
import { useState } from 'react';

export default function SettingsHelpContent({ user, onNotify }) {
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Settings & Help</h1>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-purple-400 flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{user?.name}</p>
              <p className="text-base text-gray-600">Patient ID: #{user?.patientId}</p>
            </div>
          </div>
          
          {/* grid-cols-1 sm:grid-cols-2: 1 column on phone, 2 columns on tablet/desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
             <div>
                <p className="text-sm text-gray-600">Email Address</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
             </div>
             <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{user?.phone || 'Not provided'}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}