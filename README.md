# **GTM Tag Tempalte - Ad Click ID Storer (v1.0)**

This Google Tag Manager (GTM) **Custom Template** captures and persists advertising click ID data in a first-party cookie and localStorage as rich JSON objects.

The script provides deep insights into user journeys by tracking not just the latest value, but also interaction counts and historical values for each parameter. The collected data can be pushed to the dataLayer for seamless integration with server-side GTM for use in Google Analytics, ad platforms (CAPI) and your backend systems.

Built by Daniel Perry-Reed @ [Kickflip Analytics](https://kickflipanalytics.com/?utm_medium=github&utm_source=gtm-ad-click-id-storer).

## **🚀 Key Features**

* **Comprehensive Parameter Capture**: Tracks most commin ad click IDs (listed below), and any custom-defined parameters. All defined paramters are **case sensative**.
  * 'gclid', 'gbraid', 'wbraid', 'gad_campaignid', // Google
  * 'fbclid', // Facebook/Meta
  * 'msclkid', // Microsoft/Bing
  * 'ttclid', // TikTok
  * 'twclid', // Twitter/X
  * 'li_fat_id', // LinkedIn
  * 'awc', // Awin
  * 'sccid', // Snap
  * 'rdt_cid', // Reddit
  * 'spclid', // Spotify
  * 'qclid', // Quora
  * 'epik', // Pinterest
  * 'adct', // AdRoll
  * 'ob_click_id', // Outbrain (this is the suggested param, but is manually defined)
  * 'tbclid' // Taboola (this is the suggested param, but is manually defined)
* **Rich Data Objects**: Stores each parameter as a JSON object containing its value, a running count, the timestamp of the last update, and the page context (location and referrer).
* **Dual Storage with Sync**: Persists data in a first-party cookie and localStorage, automatically syncing between them to maximize data retention.
* **Optional Value History**: Can be configured to store the 5 most recent previous values for each parameter as an array, providing a clear history of touchpoints.
* **Intelligent Update Logic**: Optionally ignores updates from blank or self-referrals to maintain data integrity.
* **DataLayer Integration**: Optionally pushes the complete attribution object to the dataLayer on each page, making it readily available for other GTM tags.
* **Debug Logging**: Optionally log all actions to the browser console for easy debugging and verification.

## **✅ Changelog**

| Version | Changes |
| :---- | :---- |
| **v1.0** | - Captures most common ad click IDs into a detailed JSON object. <br>- Includes metadata for count, datetime, location, and referrer. <br>- Optional localStorage backup with cookie-localStorage sync. <br>- Optional dataLayer push. <br>- Option to ignore blank/self-referrals. <br>- Option to store 5 previous values per parameter in an array. |
| **future plans** | - Set values to ignore per parameter. <br>- Some sort of way to capture attribution without the use of query string parameters. <br>- TBC, let me know! |

## **🛠️ How to Use**

### **📦 Option 1: Import the Prebuilt GTM Container (Fastest)**

This method includes the custom template, a pre-configured tag, and the necessary triggers.

1. **Download the container file**: [ad-click-id-storer-container.json](./ad-click-id-storer-container.json) (you will need to create and upload this file to your repository).
2. **Import into your GTM workspace**:
   * Navigate to **GTM Admin \> Import Container**.
   * Upload the downloaded JSON file.
   * Choose your desired workspace.
   * Select the **Merge** import option and choose **Rename conflicting tags, triggers, and variables**.
3. **Review and publish** the changes.

### **✍️ Option 2: Manual Setup**

#### **1\. Add the Custom Template Code**

* In the GTM UI, navigate to **Templates \> Tag Templates \> New**.
* Download the [ad-click-id-storer-template.tpl](./ad-click-id-storer-template.tpl) code from this repository.
* Import the downloaded tamplate file into GTM.

#### **2\. Add tag and configure**

* Go to **Tags \> New** and select your newly created custom template.
* Configure the fields as desired.
* Assign a trigger to the tag. A **All Pages** trigger (or your page view event trigger for SPAs) is recommended.
* Set your desired consent requirements.
* Save the tag and QA.
* Publish your container.

## **🧠 Example JSON Stored**

Here is an example of the JSON object that gets stored in the cookie and localStorage if a user has visited three times with different gclid values, and once with a utm_source:

```json
{
  "gclid": {
    "value": "Cj0KCQjwmICoBhDxARIsABXk",
    "count": 5,
    "datetime": "2025-10-14T12:30:15.123Z",
    "location": "https://yourwebsite.com/product?gclid=Cj0KCQjwmICoBhDxARIsABXk",
    "referrer": "https://google.com/",
    "previous_values": ["abc-123","xyz-987"]
  },
  "fbclid": {
    "value": "abc123-987zyx",
    "count": 1,
    "datetime": "2025-10-14T12:30:15.123Z",
    "location": "https://yourwebsite.com/blog?fbclid=abc123-987zyx",
    "referrer": "https://facebook.com/",
    "previous_values": []
  }
}
```

## **📄 License**

This project is licensed under the **MIT License**.
