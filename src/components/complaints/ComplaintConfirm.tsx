import { useEffect, useState } from 'react';

import food from '../../assets/icons/categories/tags/food.svg';
import general from '../../assets/icons/categories/tags/general.svg';
import other from '../../assets/icons/categories/tags/other.svg';
import recycle from '../../assets/icons/categories/tags/recycle.svg';
import X from '../../assets/icons/navigation/arrows/X.svg';
import { uploadFilesToCloudflare } from '../../services/fileUploadService';
import { useComplaintFormStore } from '../../stores/complaintFormStore';
import { formatAddressWithDong } from '../../utils/dongMapping';
import DateTimeBox from '../forms/DateTimeBox';
import TextForward from '../forms/TextForward';

// import { formatDateToYYMMDD } from "@/utils/formatDateToYYMMDD";

interface ComplaintConfirmProps {
  onSubmit: (uploadedFileKeys?: string[]) => void | Promise<void>;
  onBack?: () => void;
}

export default function ComplaintConfirm({
  onSubmit,
  onBack,
}: ComplaintConfirmProps) {
  // Get form data from Zustand store
  const { formData, driverData, updateFormData } = useComplaintFormStore();
  const [formattedAddress, setFormattedAddress] = useState(formData.address);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Format address with dong info asynchronously
  useEffect(() => {
    const formatAddress = async () => {
      if (!formData.address) {
        setFormattedAddress('');
        return;
      }

      setIsLoadingAddress(true);
      try {
        const result = await formatAddressWithDong(formData.address);
        setFormattedAddress(result);
      } catch (error) {
        console.error('Address formatting error:', error);
        setFormattedAddress(formData.address); // Fallback to original address
      } finally {
        setIsLoadingAddress(false);
      }
    };

    formatAddress();
  }, [formData.address]);

  const handleSubmitWithUpload = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Step 1: Upload files if needed
      const filesToUpload = formData.uploadedFiles.filter(
        (file) => file.file && !file.url
      );

      if (filesToUpload.length > 0) {
        const fileObjects = filesToUpload
          .map((f) => f.file)
          .filter((f): f is File => f !== undefined);

        console.log('파일 업로드 시작:', fileObjects.length, '개 파일');

        // Upload files to Cloudflare
        const uploadedFiles = await uploadFilesToCloudflare(
          fileObjects,
          'complaint'
        );

        // Update formData with Cloudflare keys
        const updatedFiles = formData.uploadedFiles.map((file) => {
          if (file.file && !file.url) {
            const uploaded = uploadedFiles.find(
              (uf) => uf.originalName === file.name
            );
            if (uploaded) {
              return {
                ...file,
                url: uploaded.key,
              };
            }
          }
          return file;
        });

        updateFormData({ uploadedFiles: updatedFiles });
        console.log('파일 업로드 완료');
      }

      // Step 2: Collect all uploaded file keys (both newly uploaded and already uploaded)
      // Get the latest state after update
      const currentFormData = useComplaintFormStore.getState().formData;
      const allUploadedFileKeys = currentFormData.uploadedFiles
        .filter((file) => file.url && file.url.trim() !== '') // Only files that have been uploaded (have a key)
        .map((file) => file.url as string); // Extract the Cloudflare keys

      console.log('전송할 파일 키들:', allUploadedFileKeys);

      // Step 3: Immediately proceed to submit complaint with file keys
      // Pass file keys directly to avoid timing issues with store updates
      try {
        await onSubmit(allUploadedFileKeys);
      } catch (submitError) {
        throw new Error(
          submitError instanceof Error
            ? submitError.message
            : '민원 제출에 실패했습니다.'
        );
      }

      // If we reach here, submission was successful
      // (onSubmit handles success popup in ComplaintManage)
    } catch (error) {
      console.error('파일 업로드 또는 민원 제출 실패:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : '파일 업로드 또는 민원 제출에 실패했습니다.';
      setSubmitError(errorMessage);
      // Don't proceed if upload or submission fails
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getNotifyData = () => {
    return formData.notify?.usernames || [];
  };

  // Helper function to get driver for specific category
  const getDriverForCategory = (category: string) => {
    const team = driverData.teams.find((team) => team.category === category);
    return team?.drivers[0] || null; // Get first driver if multiple
  };

  // Helper function to get team for specific category
  const getTeamForCategory = (category: string) => {
    return driverData.teams.find((team) => team.category === category) || null;
  };

  // Render driver information with loading and error states
  const renderDriverInfo = (category: string) => {
    if (driverData.loading) {
      return (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">기사님 정보 로딩 중...</p>
        </div>
      );
    }

    if (driverData.error) {
      return (
        <div className="text-center py-4">
          <p className="text-sm text-red-500">{driverData.error}</p>
        </div>
      );
    }

    const driver = getDriverForCategory(category);
    const team = getTeamForCategory(category);

    return (
      <>
        <div className="flex md:justify-between justify-start pt-3 pb-2">
          <div className="flex">
            <img
              src={
                category === '음식물'
                  ? food
                  : category === '재활용'
                    ? recycle
                    : category === '기타'
                      ? other
                      : category === '생활'
                        ? general
                        : ''
              }
              className="w-1/3 mr-2"
              alt="쓰레기 종류 태그"
            />
            <p className="text-black 3xl:text-base text-sm">
              {driver ? `${driver.name} 기사님` : '기사 정보 없음'}
            </p>
          </div>
          <p className="text-light-green 3xl:text-base text-sm">
            {driver ? '운행중' : '정보 없음'}
          </p>
        </div>
        <div className="text-sm text-left text-dark-gary font-normal">
          <p className="md:py-1">
            {driver ? driver.phone_no : '전화번호 없음'}
          </p>
          <p className="md:py-1">{team ? team.team_nm : '팀 정보 없음'}</p>
          <p className="md:py-1">
            {driver ? `차량번호 정보` : '차량번호 없음'}
          </p>
        </div>
      </>
    );
  };

  return (
    <div className="overflow-y-auto overflow-x-hidden w-full">
      <form className="md:border md:border-light-border rounded-[15px]">
        <DateTimeBox
          visible={false}
          repeat={formData.source.bad}
          readOnly={false}
          onBack={onBack}
          date={formData.datetime ? new Date(formData.datetime) : new Date()}
        />
        {formData.categories.map((category, idx) => {
          return (
            <div
              key={idx}
              className="flex flex-col lg:flex-row md:justify-between items-center md:px-10 mt-2 md:mt-10 mb-5 text-[1rem] md:font-bold font-semibold"
            >
              <section className="md:mr-[3rem] md:w-[65%] w-full">
                <p className="text-dark-gray">
                  민원 종류 -{' '}
                  <span className="text-black my-3 md:my-5" key={idx}>
                    {category}
                    {formData.type && ` (${formData.type})`}
                  </span>
                </p>
                <p className="text-dark-gray my-3 md:my-5">
                  민원 접수 종류 -{' '}
                  <span className="text-black">
                    {formData.route}{' '}
                    {formData.source.phone_no
                      ? `(${formData.source.phone_no})`
                      : ''}
                  </span>
                </p>
                <p className="text-dark-gray my-3 md:my-5">
                  민원 발생 주소 -{' '}
                  <span className="text-black">
                    {isLoadingAddress ? (
                      <span className="text-gray-500">
                        주소 정보 로딩 중...
                      </span>
                    ) : (
                      formattedAddress
                    )}
                  </span>
                </p>
                <p className="text-dark-gray my-3 md:my-5 flex flex-col w-full">
                  민원 내용
                  <span className="text-black md:mt-5 mt-3 md:p-5 bg-efefef rounded h-[7rem] whitespace-pre-wrap">
                    {formData.content}{' '}
                  </span>
                </p>

                {/* 업로드된 파일 미리보기 */}
                {formData.uploadedFiles.length > 0 && (
                  <div className="mt-5 border border-light-border w-full rounded overflow-hidden text-gray-text">
                    <div className="font-normal text-sm flex justify-between bg-[#FAFAFB] px-2 py-1">
                      <div className="flex">
                        <img src={X} alt="닫기 아이콘" className="mr-2" />
                        파일명
                      </div>
                      <p>용량</p>
                    </div>
                    <div className="flex flex-col gap-3 px-2 py-2">
                      {formData.uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between w-full"
                        >
                          <div className="relative flex items-center">
                            <img
                              src={X}
                              alt="닫기 아이콘"
                              className="mr-[6px] pt-[0.5px] pl-[0.5px] cursor-pointer"
                              onClick={() => {
                                updateFormData({
                                  uploadedFiles: formData.uploadedFiles.filter(
                                    (_, i) => i !== index
                                  ),
                                });
                              }}
                            />
                            {file.type.startsWith('image/') ? (
                              <div className="w-8 h-8 rounded overflow-hidden relative group mr-2">
                                <img
                                  src={file.previewUrl || file.url}
                                  alt={file.name}
                                  className="w-8 h-8 object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRkZGRkZGIi8+CjxwYXRoIGQ9Ik00OCA1NkM1Mi40MTgzIDU2IDU2IDUyLjQxODMgNT2gNDhDNTYgNTYuNDE4MyA1Mi40MTgzIDYwIDQ4IDYwQzQzLjU4MTcgNjAgNDAgNTYuNDE4MyA0MCA1MkM0MCA0Ny41ODE3IDQzLjU4MTcgNDQgNDggNDRaIiBmaWxsPSIjQ0NDQ0NDIi8+CjxwYXRoIGQ9Ik02NCA2NEgzMkMyOS43OTQ5IDY0IDI4IDYyLjIwNTEgMjggNjBWMzJDMjggMjkuNzk0OSAyOS43OTQ5IDI4IDMyIDI4SDY0QzY2LjIwNTEgMjggNjggMjkuNzk0OSA2OCAzMlY2MEM2OCA2Mi4yMDUxIDY2LjIwNTEgNjQgNjQgNjRaIiBzdHJva2U9IiNDQ0NDQ0MiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-7 h-7 text-[1.7rem] flex items-center justify-center mr-2">
                                📄
                              </div>
                            )}
                            <p className="text-xs text-center font-medium pl-1">
                              {file.name}
                            </p>
                          </div>
                          <p className="text-xs ml-2 font-medium">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <section className="md:w-[25%] w-full md:text-center text-left">
                <p className="text-dark-gray text-lg pb-2 md:pb-3">
                  담당 기사님 정보
                </p>
                {renderDriverInfo(category)}
              </section>
            </div>
          );
        })}
        <div className="flex items-center justify-center my-8">
          <TextForward
            options={['소장님께 전달', '팀장님께 전달']}
            mobileOptions={['소장님', '팀장님']} // 모바일용 짧은 텍스트
            selectedValues={getNotifyData()}
            onChange={(updatedList) =>
              updateFormData({
                notify: { usernames: updatedList },
              })
            }
          />
        </div>
      </form>

      {/* 파일 업로드 및 민원 전송 상태 표시 */}
      {isSubmitting && (
        <div className="text-center mt-5 mb-2">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
            <span>파일 업로드 및 민원 전송 중...</span>
          </div>
        </div>
      )}

      {submitError && (
        <div className="text-center mt-5 mb-2">
          <p className="text-sm text-red-500">{submitError}</p>
        </div>
      )}

      {/* 제출 버튼 */}
      <div className="text-center mt-5">
        <button
          type="submit"
          className="bg-light-green hover:bg-green-600 text-white font-semibold px-20 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmitWithUpload}
          disabled={isSubmitting}
        >
          {isSubmitting ? '파일 업로드 및 민원 전송 중...' : '민원 전송'}
        </button>
      </div>
    </div>
  );
}
