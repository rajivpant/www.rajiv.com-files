@echo off

rem ant html

perl -pi.bak -e "BEGIN { undef $/ ; } s/Miscellany/Speaking Engagements/" resume_rajiv_pant.html
perl -pi.bak -e "BEGIN { undef $/ ; } s/Miscellany/Suitability in Global Workforce/" resume_rajiv_pant.html

echo Please open the html resume with Mozilla and save it as .txt
pause 

perl -pi.bak -e "tr[<>][()]" resume_rajiv_pant.txt
perl -pi.bak -e "BEGIN { undef $/ ; } s{^}{( Note: You may download an MS Word version of this resume\n along with a PowerPoint summary at http://www.rajiv.com/resume )\n}" resume_rajiv_pant.txt
