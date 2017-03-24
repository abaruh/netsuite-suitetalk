var soap = require('soap');

class NetSuite
{
    constructor(options)
    {
        this.client = {};
        this.accountId = options.accountId;
        this.baseUrl = options.baseUrl || 'https://webservices.netsuite.com/services/NetSuitePort_2016_2';
        this.appId = options.appId;
        this.password = options.password;
        this.roleId = options.roleId;
        this.username = options.username;
        this.wsdlPath = options.wsdlPath || 'https://webservices.netsuite.com/wsdl/v2016_2_0/netsuite.wsdl';
    }

    init(callback)
    {
        var self = this;
        soap.createClient(self.wsdlPath, {}, function(err, client)
        {
            if (err)
            {
                console.log('Error: ' + err);
                return;
            }

            client.addSoapHeader(
            {
                applicationInfo:
                {
                    applicationId: self.appId
                },
                passport:
                {
                    account: self.accountId,
                    email: self.username,
                    password: self.password,
                    role:
                    {
                        attributes:
                        {
                            internalId: self.roleId
                        }
                    }
                }
            });

            client.setEndpoint(self.baseUrl);
            self.client = client;
            callback();
        });
    };

    get(requestOptions, callback)
    {
        var wrappedData =
        {
            ':record':
            {
                'attributes':
                {
                    'xmlns:listRel': 'urn:relationships_2016_2.lists.webservices.netsuite.com',
                    'xmlns:platformCore': 'urn:core_2016_2.platform.webservices.netsuite.com',
                    'xsi:type': 'platformCore:RecordRef',
                    'type': requestOptions.type,
                    'internalId': requestOptions.internalId
                }
            }
        };
        this.client.get(wrappedData, callback);
    };
}

module.exports = NetSuite;
