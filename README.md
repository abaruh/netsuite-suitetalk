### Getting Started

Install the package using npm.

```$ npm i netsuite-suitetalk --save```

Create a new instance of the client. Initializing the client is an asynchronous operation.

``` javascript
'use strict';
const netsuite       = require('netsuite-suitetalk');
const netSuiteClient = new netsuite(
{
    accountId : YOURACCOUNTID,
    appId     : YOURAPPLICATIONID,
    baseUrl   : YOURBASEURL,     // defaults to production NS - https://webservices.netsuite.com/services/NetSuitePort_2016_2
    password  : YOURPASSWORD,
    roleId    : YOURROLEID,
    username  : YOURUSERNAME,
    wsdlPath  : YOURWSDLPATH    // defaults to wsdl (v2016_2) - https://webservices.netsuite.com/wsdl/v2016_2_0/netsuite.wsdl
});
netSuiteClient.initialize((err) =>
{
    // netSuiteClient methods are available
});
```

### Methods

###### Get Record

Get any NetSuite record by type and internalId.  This is an asynchronous call requiring the use of a callback.

```netSuiteClient.get(type, internalId, callback);```

__Arguments__

* type (String): Type of Record (i.e. 'salesOrder', 'customer')
* internalId (String|Number): Internal Id of Record
* callback (Function): ```(err, resp)```

__Example__
```
netSuiteClient.get('customer', '12345', function(err, data)
{
    if (data && data.readResponse && data.readResponse.status && data.readResponse.status.attributes && data.readResponse.status.attributes.isSuccess)
    {
        console.log(data.readResponse.record);
    }
});
```

###### Update Record

Update any allowed NetSuite record by type, internalId, and fields.  Custom fields are updated via the CustomFieldValues property.  This is an asynchronous call requiring the use of a callback.

```netSuiteClient.update(type, internalId, fields, callback);```

__Arguments__

* type (String): Type of Record (i.e. 'SalesOrder', 'Customer').  Note the different case than the get method.
* internalId (String|Number): Internal Id of Record
* fields (Hashtable): Table of name/value properties of fields to update
* callback (Function): ```(err, resp)```

__Example__
```
let fields =
{
    title: 'Developer',
    salutation: 'Mr.'
};

netSuiteClient.update('Customer', '12345', fields, function(err, data)
{
    if (err)
    {
        console.log('ERROR\n', err);
        return;
    }

    if (data && data.writeResponse && data.writeResponse.status && data.writeResponse.status.attributes && data.writeResponse.status.attributes.isSuccess)
    {
        console.log('Update was successful');
    }
});
```
