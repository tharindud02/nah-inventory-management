"use client";

import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Users,
  AlertTriangle,
  CreditCard,
  Shield,
} from "lucide-react";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <div className="flex items-center mb-4">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Terms & Conditions
            </h1>
          </div>

          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Agreement */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Agreement to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using Inventory Hub ("the Service"), you agree to
              be bound by these Terms & Conditions ("Terms"). If you do not
              agree to these Terms, please do not use our Service. These Terms
              apply to all users of the Service.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Description of Service
            </h2>
            <p className="text-gray-700 mb-4">
              Inventory Hub is a cloud-based inventory management platform that
              provides:
            </p>

            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                <span>Real-time inventory tracking and management</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                <span>Sales and purchase order processing</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                <span>Supplier and customer relationship management</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                <span>Analytics and reporting tools</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                <span>Multi-location inventory support</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                <span>Mobile and web access</span>
              </li>
            </ul>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              User Accounts
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Account Registration
                </h3>
                <p className="text-gray-700">
                  You must provide accurate, complete, and current information
                  when creating an account. You are responsible for maintaining
                  the confidentiality of your account credentials.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Account Security
                </h3>
                <p className="text-gray-700">
                  You are solely responsible for all activities that occur under
                  your account. You must notify us immediately of any
                  unauthorized use of your account.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Account Termination
                </h3>
                <p className="text-gray-700">
                  We reserve the right to suspend or terminate your account for
                  violations of these Terms or for any other reason at our sole
                  discretion.
                </p>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-blue-600" />
              Acceptable Use
            </h2>

            <p className="text-gray-700 mb-4">You agree not to:</p>

            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                <span>
                  Use the Service for any illegal or unauthorized purpose
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                <span>Violate any applicable laws or regulations</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                <span>
                  Infringe on the intellectual property rights of others
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                <span>
                  Transmit malicious code, viruses, or harmful content
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                <span>Attempt to gain unauthorized access to our systems</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                <span>Interfere with or disrupt the Service</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                <span>
                  Use the Service to send spam or unsolicited communications
                </span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                <span>
                  Reverse engineer, decompile, or disassemble any part of the
                  Service
                </span>
              </li>
            </ul>
          </section>

          {/* Subscription and Payment */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
              Subscription and Payment
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Subscription Plans
                </h3>
                <p className="text-gray-700">
                  We offer various subscription plans with different features
                  and pricing. You can view current plans and pricing on our
                  website.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Payment Terms
                </h3>
                <p className="text-gray-700">
                  Subscription fees are billed in advance on a monthly or annual
                  basis. All payments are non-refundable except as required by
                  law.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Price Changes
                </h3>
                <p className="text-gray-700">
                  We reserve the right to modify our subscription fees at any
                  time. Price changes will be communicated at least 30 days in
                  advance.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Cancellation</h3>
                <p className="text-gray-700">
                  You may cancel your subscription at any time. Cancellation
                  will take effect at the end of the current billing period.
                </p>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Intellectual Property
            </h2>

            <p className="text-gray-700 mb-4">
              The Service and its original content, features, and functionality
              are owned by Inventory Hub and are protected by international
              copyright, trademark, and other intellectual property laws.
            </p>

            <p className="text-gray-700">
              You retain ownership of any data you input into the Service.
              However, you grant us a license to use, modify, and display your
              data solely for the purpose of providing the Service.
            </p>
          </section>

          {/* Privacy and Data Protection */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Privacy and Data Protection
            </h2>

            <p className="text-gray-700 mb-4">
              Your privacy is important to us. Our collection and use of
              personal information is governed by our Privacy Policy, which is
              incorporated into these Terms by reference.
            </p>

            <p className="text-gray-700">
              By using our Service, you consent to the collection and use of
              your information as described in our Privacy Policy.
            </p>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Service Availability
            </h2>

            <p className="text-gray-700 mb-4">
              We strive to maintain high availability of the Service, but we
              cannot guarantee uninterrupted access. The Service may be
              temporarily unavailable for maintenance, updates, or other
              reasons.
            </p>

            <p className="text-gray-700">
              We are not liable for any loss or damage resulting from Service
              unavailability.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Limitation of Liability
            </h2>

            <p className="text-gray-700 mb-4">
              To the maximum extent permitted by law, Inventory Hub shall not be
              liable for any indirect, incidental, special, or consequential
              damages resulting from your use of the Service.
            </p>

            <p className="text-gray-700">
              Our total liability for any claims arising from these Terms shall
              not exceed the amount paid by you for the Service in the preceding
              12 months.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Indemnification
            </h2>

            <p className="text-gray-700">
              You agree to indemnify and hold Inventory Hub harmless from any
              claims, damages, or expenses arising from your use of the Service
              or violation of these Terms.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Termination
            </h2>

            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account immediately, without
              prior notice or liability, for any reason, including if you breach
              the Terms.
            </p>

            <p className="text-gray-700">
              Upon termination, your right to use the Service will cease
              immediately. All provisions of the Terms which by their nature
              should survive termination shall survive, including ownership
              provisions, warranty disclaimers, and limitations of liability.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Governing Law
            </h2>

            <p className="text-gray-700">
              These Terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which Inventory Hub operates,
              without regard to conflict of law principles.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Changes to Terms
            </h2>

            <p className="text-gray-700">
              We reserve the right to modify these Terms at any time. If we make
              material changes, we will notify you by email or by posting a
              notice on our website prior to the effective date of changes.
            </p>

            <p className="text-gray-700">
              Your continued use of the Service after such modifications
              constitutes your acceptance of the updated Terms.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Contact Us
            </h2>

            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms & Conditions, please
              contact us:
            </p>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">
                <strong>Email:</strong> legal@inventoryhub.com
                <br />
                <strong>Address:</strong> 123 Business Ave, Suite 100
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;City, State 12345
                <br />
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
