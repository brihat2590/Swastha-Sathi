import React from "react"

export default function Footer() {
  return (
    <footer className="bg-background border-t border-gray-200  ">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-2">
            <img
              src="/synergy.svg" 
              alt="synergyShare"
              className="w-10 h-10"
            />
            <span className="text-xl pt-2 ">Swastha Sathi</span>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-right ">
            {/* <ul className="flex items-center space-x-4"
            >
                <li>home</li>
                <li>contact</li>
                <li>testers</li>

            </ul> */}
            <p className="text-sm text-muted-foreground">
              If you have any queries, reach us at{" "}
              <a
                href="hello@synergyshare.com"
                className="text-primary hover:underline"
              >
                hello@swasthasathi.com
              </a>
            </p>
          </div>
        </div>

        {/* Divider */}
        {/* <div className="border-t my-6"></div> */}

        {/* Bottom section */}
        <div className="text-center text-sm text-muted-foreground">
          SwasthaShare © All Rights Reserved 2025
        </div>
      </div>
    </footer>
  );
}