import { useNavigate } from 'react-router-dom';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section style={{ marginBottom: '32px' }}>
      <h2 style={{ color: '#a78bfa', fontSize: '20px', marginBottom: '16px',
                   borderBottom: '1px solid rgba(167,139,250,0.3)', paddingBottom: '8px' }}>
        {title}
      </h2>
      {children}
    </section>
  );

  const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: '16px' }}>
      <h3 style={{ color: '#e5e7eb', fontSize: '15px', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: '#9ca3af', lineHeight: '1.7', fontSize: '14px' }}>{children}</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', color: 'white' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

        <button
          onClick={() => navigate(-1)}
          style={{ background: 'transparent', border: 'none', color: '#a78bfa',
                   cursor: 'pointer', marginBottom: '24px', fontSize: '14px' }}
        >
          ← Back
        </button>

        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          Terms & Conditions
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '40px', fontSize: '13px' }}>
          Last updated: {new Date().toLocaleDateString('en-US',
            { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <Section title="1. Client Terms">
          <SubSection title="1.1 Advance Payment Policy">
            All bookings and course enrollments require a non-refundable advance payment
            of 15% of the total amount. This advance is collected online via eSewa to
            confirm your booking or enrollment.
          </SubSection>
          <SubSection title="1.2 Non-Refundable Policy">
            Once the advance payment is confirmed, it is strictly non-refundable under
            any circumstances including cancellations, no-shows, rescheduling, or
            dissatisfaction. This policy applies to both service bookings and course
            enrollments without exception.
          </SubSection>
          <SubSection title="1.3 Remaining Payment">
            The remaining 85% of the total amount is to be paid directly at the salon
            in cash or by any payment method accepted by the vendor. Glambook is not
            responsible for disputes regarding on-site payments.
          </SubSection>
          <SubSection title="1.4 Cancellation Policy">
            Cancellations must be made at least 24 hours before the scheduled appointment.
            Late cancellations forfeit the advance payment. The vendor reserves the right
            to cancel bookings with at least 12 hours notice.
          </SubSection>
          <SubSection title="1.5 Booking Validity">
            A booking is confirmed only after advance payment is successfully processed.
            Unconfirmed bookings expire after 30 minutes.
          </SubSection>
          <SubSection title="1.6 Course Enrollment">
            Course advance payments follow the same 15% non-refundable policy.
            Course access is granted only after advance payment and vendor approval.
            Certificates are issued only after completing all requirements and
            receiving vendor approval.
          </SubSection>
        </Section>

        <Section title="2. Vendor Terms">
          <SubSection title="2.1 Commission Policy">
            Glambook charges a platform commission on each completed transaction.
            Commission rates are communicated during onboarding and subject to change
            with 30 days notice.
          </SubSection>
          <SubSection title="2.2 Booking Responsibilities">
            Vendors must honor all confirmed bookings. Repeated cancellations or
            no-shows may result in account suspension and removal from the platform.
          </SubSection>
          <SubSection title="2.3 Communication Standards">
            Vendors must respond to client messages within 24 hours. Failure to
            maintain communication standards may affect vendor rating and visibility.
          </SubSection>
          <SubSection title="2.4 Course Approval">
            Vendors are responsible for reviewing and approving student quiz submissions
            within 7 business days. Delayed approvals may affect vendor ratings.
          </SubSection>
          <SubSection title="2.5 Remaining Payment Collection">
            Vendors collect the remaining 85% directly from clients at the salon.
            Glambook is not involved in or responsible for on-site payment disputes.
          </SubSection>
        </Section>

        <Section title="3. Platform Terms">
          <SubSection title="3.1 Dispute Handling">
            Glambook reviews disputes between clients and vendors within 7 business days.
            Advance payments are not refunded during or after dispute resolution,
            as they are strictly non-refundable.
          </SubSection>
          <SubSection title="3.2 Reviews Policy">
            Reviews must be honest and based on genuine experience. Fake reviews or
            manipulation results in immediate account suspension. Glambook may remove
            reviews violating community guidelines without notice.
          </SubSection>
          <SubSection title="3.3 Account Suspension">
            Accounts may be suspended for: fraudulent activity, repeated policy violations,
            abusive behavior, payment fraud, or impersonation. Suspended accounts lose
            platform access immediately with no refund of any paid amounts.
          </SubSection>
          <SubSection title="3.4 Data & Privacy">
            Payment information is processed securely through eSewa and never stored on
            Glambook servers. User data is handled per our Privacy Policy and applicable
            data protection regulations.
          </SubSection>
          <SubSection title="3.5 Amendments">
            Glambook reserves the right to amend these terms at any time. Continued use
            of the platform constitutes acceptance of updated terms.
          </SubSection>
        </Section>

        <div style={{ background: 'rgba(167,139,250,0.1)',
                      border: '1px solid rgba(167,139,250,0.3)',
                      borderRadius: '12px', padding: '24px', marginTop: '40px' }}>
          <p style={{ color: '#e5e7eb', marginBottom: '8px', fontWeight: '600' }}>
            Agreement
          </p>
          <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.7' }}>
            By using Glambook, you confirm that you have read, understood, and agree
            to these Terms & Conditions in full. If you do not agree, please discontinue
            use of the platform immediately.
          </p>
          <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '12px' }}>
            Questions? Contact us at: support@glambook.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
