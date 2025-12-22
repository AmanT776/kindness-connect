import { createContext, useContext, useState, ReactNode } from 'react';
import { Complaint, ComplaintStatus, mockComplaints, generateReferenceNumber } from '@/lib/mockData';

interface ComplaintsContextType {
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'statusHistory' | 'officerComments'>) => string;
  updateComplaintStatus: (id: string, status: ComplaintStatus, comment?: string, officerName?: string) => void;
  addOfficerComment: (id: string, comment: string, officerName: string) => void;
  getComplaintByReference: (referenceNumber: string) => Complaint | undefined;
  getComplaintsByUser: (userId: string) => Complaint[];
}

const ComplaintsContext = createContext<ComplaintsContextType | undefined>(undefined);

export function ComplaintsProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);

  const addComplaint = (complaintData: Omit<Complaint, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'statusHistory' | 'officerComments'>): string => {
    const referenceNumber = generateReferenceNumber();
    const now = new Date().toISOString();
    
    const newComplaint: Complaint = {
      ...complaintData,
      id: String(Date.now()),
      referenceNumber,
      createdAt: now,
      updatedAt: now,
      status: 'received',
      statusHistory: [{ status: 'received', date: now }],
      officerComments: [],
    };
    
    setComplaints(prev => [newComplaint, ...prev]);
    return referenceNumber;
  };

  const updateComplaintStatus = (id: string, status: ComplaintStatus, comment?: string, officerName?: string) => {
    setComplaints(prev => prev.map(complaint => {
      if (complaint.id === id) {
        const now = new Date().toISOString();
        const updatedComplaint = {
          ...complaint,
          status,
          updatedAt: now,
          statusHistory: [...complaint.statusHistory, { status, date: now, comment }],
        };
        
        if (comment && officerName) {
          updatedComplaint.officerComments = [
            ...complaint.officerComments,
            { comment, date: now, officerName },
          ];
        }
        
        return updatedComplaint;
      }
      return complaint;
    }));
  };

  const addOfficerComment = (id: string, comment: string, officerName: string) => {
    setComplaints(prev => prev.map(complaint => {
      if (complaint.id === id) {
        const now = new Date().toISOString();
        return {
          ...complaint,
          updatedAt: now,
          officerComments: [
            ...complaint.officerComments,
            { comment, date: now, officerName },
          ],
        };
      }
      return complaint;
    }));
  };

  const getComplaintByReference = (referenceNumber: string) => {
    return complaints.find(c => c.referenceNumber.toLowerCase() === referenceNumber.toLowerCase());
  };

  const getComplaintsByUser = (userId: string) => {
    return complaints.filter(c => c.submitterId === userId);
  };

  return (
    <ComplaintsContext.Provider value={{ 
      complaints, 
      addComplaint, 
      updateComplaintStatus, 
      addOfficerComment,
      getComplaintByReference,
      getComplaintsByUser,
    }}>
      {children}
    </ComplaintsContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintsContext);
  if (context === undefined) {
    throw new Error('useComplaints must be used within a ComplaintsProvider');
  }
  return context;
}
