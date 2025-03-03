import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>

        <Card className="p-8 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              1. Description of Goods and Services
            </h2>
            <p className="text-muted-foreground">
              Caught Online is a business in the e-commerce retail industry that
              sells seafood direct to consumer.
            </p>
          </section>

          <Separator />

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">2. Delivery Policy</h2>
            <p className="text-muted-foreground">
              Subject to availability and receipt of payment, requests will be
              processed within 3-5 working days and delivery confirmed by way
              courier.
            </p>
          </section>

          <Separator />

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              3. Export Restriction
            </h2>
            <p className="text-muted-foreground">
              The offering on this website is available to all whom reside in
              South Africa.
            </p>
          </section>

          <Separator />

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              4. Return and Refunds Policy
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <h3 className="font-medium text-foreground">Returns</h3>
              <p>
                Our policy lasts 30 days. If 30 days have gone by since your
                purchase, unfortunately, we can&apos;t offer you a refund or
                exchange.
              </p>
              <p>
                Unfortunately, our products are exempt from being returned.
                Perishable goods such as food cannot be returned.
              </p>
              <p>
                Additional non-returnable items:
              </p>
              <ul className="list-disc list-inside mt-2 ml-4">
                <li>Gift cards</li>
              </ul>

              <h3 className="font-medium text-foreground mt-6">Refunds</h3>
              <p>
                We aim to provide our customers with only the best quality
                seafood available. Should we fall short of this and you are
                dissatisfied with your products we want to know about it. We
                will assess refunds on a case by case basis and we will also
                notify you of the approval or rejection of your refund.
              </p>
            </div>
          </section>

          <Separator />

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              5. Cancellation Policy
            </h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                In the case of a user/customer wanting to cancel a order, a full
                refund shall be deemed if:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>Order is cancelled within 12 hours of purchase.</li>
                <li>
                  Cancellation does not occur before order cut-off dispatch
                  times (before 9:00 am of the specified delivery date).
                </li>
              </ul>
              <p className="font-medium">
                *On-demand deliveries can not be refunded.
              </p>
            </div>
          </section>

          <Separator />

          {/* Sections 7-15 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">7. Payment Options</h2>
            <p className="text-muted-foreground">
              Payments may be made via Visa, MasterCard, Snapscan, zapper or by
              bank transfer into the Caught online bank account, the details of
              which will be provided on request.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-4">
              8. Card Acquiring and Security
            </h2>
            <p className="text-muted-foreground">
              Card transactions will be acquired for Caught Online via PayGate
              (Pty) Ltd who are the approved payment gateway for all South
              African Acquiring Banks. DPO PayGate uses the strictest form of
              encryption, namely Secure Socket Layer 3 (SSL3) and no Card
              details are stored on the website. Users may go to
              www.paygate.co.za to view their security policy.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-4">
              14. Company Information
            </h2>
            <p className="text-muted-foreground">
              This website is run by Caught Online (Pty) Ltd based in South
              Africa trading as Caught Online and with registration number
              2018/281975/07 and Directors/Owners Calvin Davis and Gareth
              Anderson.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-4">15. Contact Details</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                Company physical address: 43A, Killarney Avenue, Killarney
                Gardens, Cape Town, 7441
              </p>
              <p>Email: Calvin@caughtonline.co.za</p>
              <p>Telephone: 0839373163</p>
            </div>
          </section>
        </Card>
      </div>
    </div>
  );
}