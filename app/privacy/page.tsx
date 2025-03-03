import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <Card className="p-8 space-y-8">
          <section>
            <p className="text-muted-foreground">
              This Privacy Policy describes how your personal information is
              collected, used, and shared when you visit or make a purchase from
              caughtonline.co.za.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-4">
              Personal Information We Collect
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                When you visit the Site, we automatically collect certain
                information about your device, including information about your
                web browser, IP address, time zone, and some of the cookies that
                are installed on your device. Additionally, as you browse the
                Site, we collect information about the individual web pages or
                products that you view, what websites or search terms referred
                you to the Site, and information about how you interact with the
                Site. We refer to this automatically-collected information as
                &ldquo;Device Information&ldquo;.
              </p>

              <div>
                <p className="mb-2">
                  We collect Device Information using the following
                  technologies:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    &ldquo;Cookies&ldquo; are data files that are placed on
                    your device or computer and often include an anonymous
                    unique identifier.
                  </li>
                  <li>
                    &ldquo;Log files&ldquo; track actions occurring on the
                    Site, and collect data including your IP address, browser
                    type, Internet service provider, referring/exit pages, and
                    date/time stamps.
                  </li>
                  <li>
                    &ldquo;Web beacons&ldquo;, &ldquo;tags&ldquo;, and
                    &ldquo;pixels&ldquo; are electronic files used to record
                    information about how you browse the Site.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-4">
              How Do We Use Your Personal Information?
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                We use the Order Information that we collect generally to
                fulfill any orders placed through the Site (including processing
                your payment information, arranging for shipping, and providing
                you with invoices and/or order confirmations).
              </p>
              <div>
                <p className="mb-2">
                  Additionally, we use this Order Information to:
                </p>
                <ul className="list-disc list-inside ml-4">
                  <li>Communicate with you</li>
                  <li>Screen our orders for potential risk or fraud</li>
                  <li>
                    When in line with the preferences you have shared with us,
                    provide you with information or advertising relating to our
                    products or services
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-4">
              Sharing Your Personal Information
            </h2>
            <p className="text-muted-foreground">
              We share your Personal Information with third parties to help us
              use your Personal Information, as described above. For example, we
              use Woocommerce to power our online store. We also use Google
              Analytics to help us understand how our customers use the Site.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              For more information about our privacy practices, if you have
              questions, or if you would like to make a complaint, please
              contact us by e-mail at gareth@caughtonline.co.za
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
}
