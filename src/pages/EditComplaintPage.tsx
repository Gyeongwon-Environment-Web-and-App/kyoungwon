import React, { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { complaintService } from '@/services/complaintService';
import { useComplaintFormStore } from '@/stores/complaintFormStore';
import type { Complaint } from '@/types/complaint';

import Header from '../components/common/Header';
import ComplaintForm from '../components/complaints/ComplaintForm';
import DateTimeBox from '../components/forms/DateTimeBox';

const EditComplaintPage: React.FC = () => {
  const { complaintId } = useParams<{ complaintId: string }>();
  const navigate = useNavigate();
  const { logout: storeLogout } = useAuth();

  // Enhanced logout function with navigation
  const logout = () => {
    storeLogout();

    // Navigate after state update
    setTimeout(() => {
      navigate('/login');
    }, 0);
  };

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalComplaint, setOriginalComplaint] = useState<Complaint | null>(
    null
  );

  const { formData, populateFormForEdit, resetForm } = useComplaintFormStore();

  // Load complaint data when component mounts
  useEffect(() => {
    if (!complaintId) {
      setError('민원 ID가 제공되지 않았습니다.');
      setIsLoading(false);
      return;
    }

    const loadComplaintData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const complaint = await complaintService.getComplaintById(complaintId);
        setOriginalComplaint(complaint);
        populateFormForEdit(complaint);
      } catch (err) {
        console.error('Failed to load complaint for editing:', err);
        setError('민원 데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadComplaintData();
  }, [complaintId, populateFormForEdit]);

  const handleEditSubmit = async () => {
    if (!originalComplaint) {
      console.error('No original complaint data');
      return;
    }

    try {
      const objectInfos =
        formData.uploadedFiles && formData.uploadedFiles.length > 0
          ? formData.uploadedFiles
              .filter((file) => file.url && file.url.trim() !== '')
              .map((file) => ({
                objectKey: file.url as string,
                filenameOriginal:
                  file.name || file.url.split('/').pop() || 'file',
              }))
          : undefined;

      // Prepare update data according to API requirements
      const updateData = {
        phone_no: formData.source?.phone_no || '',
        content: formData.content || '',
        type: formData.type || '',
        route: formData.route || '',
        // Note: status is not updated in edit mode, only in status change
        ...(objectInfos && { objectInfos }),
      };

      // Prepare original complaint data for comparison
      const originalData = {
        phone_no: originalComplaint.source?.phone_no || '',
        content: originalComplaint.content || '',
        type: originalComplaint.type || '',
        route: originalComplaint.route || '',
        status: originalComplaint.status,
        presigned_links: originalComplaint.presigned_links || [],
      };

      console.log('Updating complaint:', originalComplaint.id, updateData);

      // Call the update API with original data for comparison
      await complaintService.updateComplaint(
        originalComplaint.id,
        updateData,
        originalData
      );

      console.log('Complaint updated successfully');

      // Navigate back to the complaint detail view
      navigate(`/map/overview/complaints/${originalComplaint.id}`);
    } catch (err) {
      console.error('Failed to update complaint:', err);
      alert('민원 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // Handle cancel - navigate back
  const handleCancel = () => {
    if (originalComplaint) {
      navigate(`/map/overview/complaints/${originalComplaint.id}`);
    } else {
      navigate('/map/overview/complaints');
    }
  };

  // Cleanup form when component unmounts
  useEffect(() => {
    return () => {
      resetForm();
    };
  }, [resetForm]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen relative">
        <Header onLogout={logout} />
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">민원 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen relative">
        <Header onLogout={logout} />
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={handleCancel}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen relative">
      <Header onLogout={logout} />

      <div className="flex flex-col h-full">
        {/* Page Header */}
        <div className="flex items-center md:pb-4 py-2 border-b border-gray-200 md:pl-[16.5%]">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              돌아가기
            </button>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 pl-5">
              민원 수정
            </h1>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-4 pb-10 md:pb-4">
          <div className="max-w-4xl mx-auto">
            <ComplaintForm
              dateTimeBox={
                <DateTimeBox
                  visible={true}
                  repeat={false}
                  readOnly={false}
                  onBack={handleCancel}
                  date={
                    formData.datetime ? new Date(formData.datetime) : new Date()
                  }
                />
              }
              onSubmit={handleEditSubmit}
              isEditMode={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditComplaintPage;
