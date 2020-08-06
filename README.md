# DataDeck
DataDeck is a sales lead generation tool.  The long-term plan is to create a tool that aggregates contact data from various sources to provide a source of sales leads that can be used by non-profits and for-profit organizations.

The current functionality consists of:
1) User uploads land ownership records from LandVision.
2) DataDeck matches records from LandVision owner entities to the (<a href="https://www.sos.ca.gov/">Secretary of State SOS CA)</a> entity (LLC/Corporation) records
3) Matching the natural person records above with phone number and emails from online people contact databases.

# Installation
1. Create a <a href"https://github.com/">GitHub</a> account, if you dont have one already.
1. Go to <a href="https://github.com/datadeckllc/datadeck">https://github.com/datadeckllc/datadeck</a>.
1. Set up the `.env.local` file
  1.  Copy the `sample.env` file to `.env.local` and customize as necessary
1. Run `npm install`

# Running DataDeck - Development
1.  Run `npm run dev`
1.  Go to `http://localhost:3000` in the browser.  API requests are sent to `http://localhost:3000/api`

# Running DataDeck - Production
1.  Run `npm`
1.  Run `npm run build`
1.  Run `npm run start`
    
# Contributing
*  The app is build with [Next.js](https://nextjs.org).
*  Please open a PR for new features

