class Solution:
    def isMatch(self, s, p):
        """
        :type s: str
        :type p: str
        :rtype: bool
        """
        p_index = 0
        s_index = 0
        if s == p:
            return True
        if s == '' or p == '':
            return False

        for index in range(len(s)):
            print(s[index])
            if s[index] == p[index]:


if __name__ == '__main__':
    s = "mississippi"
    p = "mis*is*p*."
    # s = ''
    # p = ''
    solu = Solution()
    print(solu.isMatch(s, p))