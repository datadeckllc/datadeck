# DataDeck
DataDeck is a sales lead generation tool to aggregate data from various data sources.  The tool can be used by non-profits and for-profit organizations alike.

The current functionality consists of:
1) User uploads land ownership records from LandVision.
2) DataDeck matches records from LandVision owner entities to the (<a href="https://www.sos.ca.gov/">Secretary of State SOS CA)</a> entity (LLC/Corporation) records
3) DataDeck matches the natural person records above with phone number and emails scraped from online people contact databases.

# Installation
1. Create a <a href"https://github.com/">GitHub</a> account, if you dont have one already.
1. Create a directory to contain all of the DataDeck packages, e.g., `mkdir ~/datadeckllc`
1. Run `cd ~/projects/datadeckllc`
1. On this GitHub page, click the `Code` button and copy the URL for this repository.
1. Run `git clone <git repo url>`
1. Run `cd datadeck`
1. Set up the `.env.local` file
  1.  Copy the `sample.env` file to `.env.local` and customize the environment variables as necessary.  The values in `sample.env` should work without need for modifications if you are running DataDeck locally
1. Run `npm install`
1. Run `cd ~/projects/datadeckllc`
1. Go to https://github.com/datadeckllc/ddpkg and follow the instructions to install the Go packages.  Make sure that ddpkg is set up in a sibling directory next to the `datadeck` directory.
1  

# Running DataDeck - Development
1.  After installation, run `npm run dev`
1.  DataDeck is now running locally.  There is no need to run ddpkg separately
1.  Go to `http://localhost:3000` in the browser.  API requests are sent to `http://localhost:3000/api`

# Running DataDeck - Production
1.  Set up a virtual machine in a cloud system such as AWS (EC2 container), GCP (Compute Engine), Digital Ocean, etc.
1.  SSH into the machine and follow the Installation instructions above.
1.  Run `npm install`
1.  Run `npm run build`
1.  Run `npm run start`.
1.  Once you verify that the application is running and works, click `CTTRL-C` and run `nohup npm run start &> nohup.out &` so the app doesn't shut down when you exit the terminal
    
# Contributing
*  The app is build with [Next.js](https://nextjs.org).
*  Please open a PR for new features


