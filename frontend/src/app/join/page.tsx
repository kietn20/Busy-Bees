// Purpose: Page for users to join a group using an invite code

'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { joinGroup } from '@/services/groupApi';
import { AxiosError } from 'axios';
import toast from "react-hot-toast";

export default function JoinGroupPage() {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // auto fill invite code from URL on mount
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setInviteCode(codeFromUrl.toUpperCase());
    }
  }, [searchParams]);



  // extract invite code from URL
  const extractInviteCode = (input: string): string => {
    try {
      // check if input contains a URL pattern
      if (input.includes('://') || input.includes('join?code=')) {
        const url = new URL(input.startsWith('http') ? input : `http://${input}`);
        const codeParam = url.searchParams.get('code');
        if (codeParam) {
          return codeParam.toUpperCase();
        }
      }
    } catch {
      // err
    }
    return input.toUpperCase();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const code = extractInviteCode(pastedText);
    setInviteCode(code);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const code = extractInviteCode(input);
    setInviteCode(code);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await joinGroup(inviteCode);

      toast.success("Joined group successfully.");
      // on success, redirect to the group page
      const groupId = response.data.group.id;
      router.push(`/groups/${groupId}`);

    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const message = axiosError.response?.data?.message || 'Failed to join group. Please check the code and try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex items-center justify-center mt-20">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center">Join a Group</h1>
          <p className="text-center text-gray-600">Enter an invite code to join an existing course group.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700">
                Invite Code
              </label>
              <input
                id="inviteCode"
                name="inviteCode"
                type="text"
                placeholder="e.g. 12ABCD or paste invite link"
                required
                value={inviteCode}
                onChange={handleChange}
                onPaste={handlePaste}
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>


            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {isLoading ? 'Joining...' : 'Join Group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}