'use strict';

const soap = require('soap');

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
}

NetSuite.prototype.initialize = function(callback)
{
    soap.createClient(this.wsdlPath, {}, (err, client) =>
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
                applicationId: this.appId
            },
            passport:
            {
                account: this.accountId,
                email: this.username,
                password: this.password,
                role:
                {
                    attributes:
                    {
                        internalId: this.roleId
                    }
                }
            }
        });

        client.setEndpoint(this.baseUrl);
        this.client = client;
        callback();
    });
};

NetSuite.prototype.get = function(type, internalId, callback)
{
    let wrappedData =
    {
        ':record':
        {
            'attributes':
            {
                'xmlns:listRel': 'urn:relationships_2016_2.lists.webservices.netsuite.com',
                'xmlns:platformCore': 'urn:core_2016_2.platform.webservices.netsuite.com',
                'xsi:type': 'platformCore:RecordRef',
                'type': type,
                'internalId': internalId
            }
        }
    };

    this.client.get(wrappedData, callback);
};

NetSuite.prototype.mapSso = function(email, password, account, role, authenticationToken, partnerId, callback)
{
    // The mapSso operation seems to want to require a separate login before calling mapSso.  It does not like
    // the request-level credentials method and throws an Ambiguous Authentication error.  So do not initialize
    // before calling login.
    login(function(client, loginResponse)
    {
        let wrappedData =
        {
            ':ssoCredentials':
            {
                'attributes':
                {
                    'xmlns:platformCore': 'urn:core_2016_2.platform.webservices.netsuite.com',
                    'xsi:type': 'platformCore:SsoCredentials'
                },
                'email': email,
                'password': password,
                'account': account,
                'role':
                {
                    'attributes':
                    {
                        'xsi:type': 'platformCore:RecordRef',
                        'internalId': role
                    }
                },
                'authenticationToken': authenticationToken,
                'partnerId': partnerId
            }
        };

        client.mapSso(wrappedData, function(mapSsoResponse)
        {
            logout();
            callback();
        });
    });
};

NetSuite.prototype.update = function(type, internalId, fields, callback)
{
    let wrappedData =
    {
        ':record':
        {
            'attributes':
            {
                'xmlns:listRel': 'urn:relationships_2016_2.lists.webservices.netsuite.com',
                'xmlns:platformCore': 'urn:core_2016_2.platform.webservices.netsuite.com',
                'xsi:type': 'listRel:' + type,
                'internalId': internalId
            }
        }
    };

    for (let property in fields)
    {
        if (property === 'customFieldList')
        {
            for (let customFieldProperty in fields.customFieldList)
            {
                //wrappedData[':record'].attributes['listRel:' + property] = fields[property];
            }
        }
        else
        {
            wrappedData[':record'].attributes['listRel:' + property] = fields[property];
        }
    }

    this.client.update(wrappedData, callback);
};

function login(callback)
{
    soap.createClient(this.wsdlPath, {}, (err, client) =>
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
                applicationId: this.appId
            }
        });

        client.setEndpoint(this.baseUrl);

        var passport =
        {
            account: this.accountId,
            email: this.username,
            password: this.password,
            role:
            {
                attributes:
                {
                    internalId: this.roleId
                }
            }
        }

        var loginResponse = client.login(passport);
        callback(client, loginResponse);
    });
};

function logout(client, callback)
{
    client.logout(callback);
};

module.exports = NetSuite;
