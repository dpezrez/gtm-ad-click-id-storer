# **GTM Attribution Storer Tag Script (v1.0)**

This Google Tag Manager (GTM) **Custom Template** captures and persists marketing attribution data in a first-party cookie and localStorage as rich JSON objects.

The script provides deep insights into user journeys by tracking not just the latest value, but also interaction counts and historical values for each parameter. The collected data can be pushed to the dataLayer for seamless integration with GA4, analytics platforms, and backend systems.

Built by Daniel Perry-Reed @ [Kickflip Analytics](https://kickflipanalytics.com/?utm_medium=github&utm_source=gtm-attribution-data-storer).

## **🚀 Key Features**

* **Comprehensive Parameter Capture**: Tracks standard UTMs (utm\_source, utm\_medium, etc.), common ad click IDs (gclid, fbclid, msclkid), and any custom-defined parameters.  
* **Rich Data Objects**: Stores each parameter as a JSON object containing its value, a running count, the timestamp of the last update, and the page context (location and referrer).  
* **Dual Storage with Sync**: Persists data in a first-party cookie and localStorage, automatically syncing between them to maximize data retention.  
* **Optional Value History**: Can be configured to store the 5 most recent previous values for each parameter, providing a clear history of touchpoints.  
* **Intelligent Update Logic**: Optionally ignores updates from blank or self-referrals to maintain data integrity.  
* **DataLayer Integration**: Pushes the complete attribution object to the dataLayer on page load, making it readily available for other GTM tags.  
* **Debug Logging**: Includes an option to log all actions to the browser console for easy debugging and verification.

## **✅ Changelog**

| Version | Changes |
| :---- | :---- |
| **v1.0** | - Captures UTMs and other Click IDs into a detailed JSON object. <br>- Includes metadata for count, datetime, location, and referrer. <br>- Optional localStorage backup with cookie-localStorage sync. <br>- Optional dataLayer push. <br>- Option to ignore blank/self-referrals. <br>- Option to store 5 previous values per parameter in an array. |
| **future plans** | - Set values to ignore per parameter. <br>- Some sort of way to capture attribution without the use of query string parameters. <br>- TBC, let me know! |

## **🛠️ How to Use**

### **📦 Option 1: Import the Prebuilt GTM Container (Fastest)**

This method includes the custom template, a pre-configured tag, and the necessary triggers.

1. **Download the container file**: [atrribution-data-storer-container.json](./atrribution-data-storer-container.json) (you will need to create and upload this file to your repository).  
2. **Import into your GTM workspace**:  
   * Navigate to **GTM Admin \> Import Container**.  
   * Upload the downloaded JSON file.  
   * Choose your desired workspace.  
   * Select the **Merge** import option and choose **Rename conflicting tags, triggers, and variables**.  
3. **Review and publish** the changes.

### **✍️ Option 2: Manual Setup**

#### **1\. Add the Custom Template Code**

* In the GTM UI, navigate to **Templates \> Tag Templates \> New**.  
* Copy the [atrribution-data-storer-template.js](./atrribution-data-storer-template.js) code from this repository and paste into the Code section of the template.  

#### **2\. Configure Template Fields**

Create a new tag using the imported template and configure the following fields as needed:

| Field Name | Type | Description | Default Value |
| :---- | :---- | :---- | :---- |
| cookieName | Text | The name for the first-party cookie. | attr\_data |
| cookieDomain | Text | The domain for the cookie. auto is recommended. | auto |
| cookieHours | Text | The lifetime of the cookie in hours. | 720 (30 days) |
| extraClickIds | Text | A comma-separated list of any additional query parameters to track (e.g., hsa\_cam, \_branch\_match\_id). | *(blank)* |
| enableLocalStorage | Checkbox | If checked, stores attribution data in localStorage as a backup. | false |
| pushToDataLayer | Checkbox | If checked, pushes the attribution object to the dataLayer on page load. | false |
| dataLayerEventName | Text | The event name to use for the dataLayer push. | gtm\_attr |
| logMessages | Checkbox | If checked, enables detailed console logging for debugging. | false |
| ignoreSelfReferrals | Checkbox | If checked, prevents updates if the referrer is blank or the same as the page's host. | false |
| storePreviousValues | Checkbox | If checked, stores the 5 most recent previous values for each parameter. | false |

#### **3\. Set Template Permissions**

In the template editor, go to the **Permissions** tab and grant access to the following APIs:

* **Reads Cookie Value(s)**: cookieName (or allow any).  
* **Sets a Cookie**: cookieName (or allow any).  
* **Accesses Local Storage**:  
  * **Read**: attr\_data  
  * **Write**: attr\_data  
* **Reads URL**: Any component.  
* **Reads Referrer URL**: Any component.  
* **Reads Data Layer**: event (or allow any).  
* **Pushes Data to Data Layer**: event (or allow any).  
* **Gets Timestamp**: Allowed.  
* **Logs to Console**: Allowed.  
* **Reads Query Parameters**: Any parameter.

#### **4\. Create and Trigger the Tag**

* Go to **Tags \> New** and select your newly created custom template.  
* Configure the fields as desired (see step 2).  
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
    "count": 3,  
    "datetime": "2025-10-14T12:30:15.123Z",  
    "location": "https://yourwebsite.com/features?gclid=Cj0KCQjwmICoBhDxARIsABXk",  
    "referrer": "https://google.com/",  
    "previous_values": ["abc-123","xyz-987"]  
  },  
  "utm_source": {  
    "value": "google",  
    "count": 1,  
    "datetime": "2025-10-14T12:30:15.123Z",  
    "location": "https://yourwebsite.com/features?gclid=Cj0KCQjwmICoBhDxARIsABXk",  
    "referrer": "https://google.com/"  
  }  
}
```

## **📄 License**

This project is licensed under the **MIT License**.
