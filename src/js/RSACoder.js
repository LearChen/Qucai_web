define(function (require)
{
    require('security');

    /**
     * 用公钥加密数据。
     *
     * @param data 待加密的数据
     * @param publicExponent 公钥指数
     * @param publicModulus 公钥模数
     * @return 16进制的加密数据
     */
    var encryptByPublicKey = function (data, publicExponent, publicModulus)
    {
        RSAUtils.setMaxDigits(1024);
        var publicKey = RSAUtils.getKeyPair(publicExponent, '', publicModulus);
        var encryptData = RSAUtils.encryptedString(publicKey, data);
        return encryptData;
    };

    return{
        encryptByPublicKey:encryptByPublicKey
    }

});