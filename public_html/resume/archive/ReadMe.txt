After running "ant html"

build.cmd does steps #1, #2.1, & #2.3 below.
#2.1 is manual!

Step 1: Post-XML Editing
In resume_rajiv_pant.html, replace heading "Miscellany" below awards and honors
section with "Speaking Engagements". The following command may be used to do this:

perl -pi.bak -e "s/Miscellany/Speaking Engagements/" resume_rajiv_pant.html

Step 2.1: Plain Text
Open resume_rajiv_pant.html in Mozilla and save it as resume_rajiv_pant.txt.
Mozilla does the best html to text conversion I have seen so far. It inserts link URLs
in the text file. It also converts bullets to asterisks and does a good job with
line breaks and indentation.
Step 2.2: Replace "<" and ">" around URL links with "(" and ")". The following command may be used to do this:

perl -pi.bak -e "tr[<>][()]" resume_rajiv_pant.txt

Step 2.3: Paste the following two lines at the top of the plain text resume.
--- cut below ---
( Note: You may download an MS Word version of this resume
 along with a PowerPoint summary at http://www.rajiv.com/resume )

--- cut above ---

Step 3: Word Doc
Open resume_rajiv_pant.html in MS Word.
Select all the resume body text. Copy it to the Windows clipboard.
Open the existing resume_rajiv_pant.doc in MS Word.
Select all the resume body text, leaving the headers and footers.
Paste the copied text over this selection.
Update the resume version number in the document footer.

Step 4: PDF
Then save resume_rajiv_pant.doc as a PDF file named resume_rajiv_pant.pdf using the
PDF Writer option in MS Word.
Then open the PDF file in Acrobat and make the URLs in the header and footer hyperlinks.
(The PDF writer version I have does not hyperlink these for some reason.)

Step 5: Viewable in HTML frame
Insert
<base target="_top">
in the head section of resume_rajiv_pant.html

